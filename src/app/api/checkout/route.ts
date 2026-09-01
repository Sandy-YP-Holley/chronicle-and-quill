import { NextRequest } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/mongodb";
import { jsonResponse, validationErrorResponse, problemResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { parseObjectId, containsRawCreditCardData } from "@/lib/validators";
import { ShippingAddressSchema } from "@/models/order";

const CheckoutRequestSchema = z.object({
  shippingAddress: ShippingAddressSchema,
  items: z
    .array(
      z.object({
        bookId: z.string().trim(),
        quantity: z.number().int().min(1),
      })
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  try {

    const session = await getSession();
    if (!session?.userId) {
      return problemResponse(
        401,
        "Unauthorized",
        "Authentication is required to place an order.",
        {
          type: "https://chronicleandquill.com/errors/unauthorized",
          instance: request.nextUrl.pathname,
        }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return problemResponse(
        400,
        "Bad Request",
        "Invalid JSON payload supplied in request body.",
        { instance: request.nextUrl.pathname }
      );
    }

    if (containsRawCreditCardData(body)) {
      return problemResponse(
        400,
        "Payment Security Rejection",
        "Chronicle & Quill uses simulated payment processing. Submitting raw credit card numbers, PANs, or CVV security codes is prohibited for PCI-DSS compliance.",
        {
          type: "https://chronicleandquill.com/errors/pci-compliance-violation",
          instance: request.nextUrl.pathname,
        }
      );
    }

    const parseResult = CheckoutRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error, request.nextUrl.pathname);
    }

    const { shippingAddress, items: requestItems } = parseResult.data;

    const ordersCollection = await getCollection("orders");
    const booksCollection = await getCollection("books");
    const cartsCollection = await getCollection("carts");
    const idempotencyCollection = await getCollection("idempotency_keys");

    await idempotencyCollection.createIndex(
      { key: 1, userId: 1 },
      { unique: true, name: "idempotency_key_user_idx" }
    );
    await idempotencyCollection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 86400, name: "idempotency_ttl_idx" }
    );

    const clientKey = request.headers.get("idempotency-key") || request.headers.get("Idempotency-Key");
    const idempotencyKey = clientKey
      ? clientKey.trim()
      : `auto_${crypto.createHash("sha256").update(session.userId + JSON.stringify(body)).digest("hex").slice(0, 32)}`;

    try {
      await idempotencyCollection.insertOne({
        key: idempotencyKey,
        userId: session.userId,
        status: "processing",
        createdAt: new Date(),
      });
    } catch (err: unknown) {
      const mongoError = err as { code?: number };
      if (mongoError.code === 11000) {
        const existing = await idempotencyCollection.findOne({
          key: idempotencyKey,
          userId: session.userId,
        });

        if (existing?.status === "completed" && existing?.orderId) {
          const order = await ordersCollection.findOne({ _id: new ObjectId(String(existing.orderId)) });
          return jsonResponse({
            message: "Order already confirmed (idempotent replay).",
            orderId: existing.orderId,
            order,
          });
        }

        return problemResponse(
          409,
          "Conflict",
          "A checkout transaction with this idempotency key is currently being processed. Please wait.",
          { instance: request.nextUrl.pathname }
        );
      }
      throw err;
    }

    let itemsToProcess: Array<{ bookId: string; quantity: number }> = [];

    if (requestItems && requestItems.length > 0) {
      itemsToProcess = requestItems;
    } else {
      const userCart = await cartsCollection.findOne({ userId: session.userId });
      if (!userCart || !Array.isArray(userCart.items) || userCart.items.length === 0) {
        await idempotencyCollection.deleteOne({ key: idempotencyKey, userId: session.userId });
        return problemResponse(
          400,
          "Empty Cart",
          "Your cart contains no volumes to purchase.",
          { instance: request.nextUrl.pathname }
        );
      }
      itemsToProcess = userCart.items;
    }

    const snapshotItems: Array<{
      bookId: string;
      title: string;
      authors: string[];
      format: string;
      price: number;
      quantity: number;
      lineTotal: number;
      imageUrl: string;
      sellerId?: string;
    }> = [];

    let subtotal = 0;

    for (const item of itemsToProcess) {
      const bookObjectId = parseObjectId(item.bookId);
      if (!bookObjectId) {
        await idempotencyCollection.deleteOne({ key: idempotencyKey, userId: session.userId });
        return problemResponse(
          400,
          "Invalid Book Identifier",
          `Invalid book ID format: "${item.bookId}".`,
          { instance: request.nextUrl.pathname }
        );
      }

      const book = await booksCollection.findOne({ _id: bookObjectId });
      if (!book) {
        await idempotencyCollection.deleteOne({ key: idempotencyKey, userId: session.userId });
        return problemResponse(
          404,
          "Book Not Found",
          `Book with ID "${item.bookId}" could not be found in the catalog.`,
          { instance: request.nextUrl.pathname }
        );
      }

      if (book.stock < item.quantity) {
        await idempotencyCollection.deleteOne({ key: idempotencyKey, userId: session.userId });
        return problemResponse(
          400,
          "Insufficient Inventory",
          `Insufficient stock for "${book.title}". Available: ${book.stock}, requested: ${item.quantity}.`,
          { instance: request.nextUrl.pathname }
        );
      }

      const price = typeof book.price === "number" ? book.price : 0;
      const lineTotal = Number((price * item.quantity).toFixed(2));
      subtotal += lineTotal;

      snapshotItems.push({
        bookId: book._id.toString(),
        title: book.title,
        authors: Array.isArray(book.authors) ? book.authors : [],
        format: book.format || "Hardcover",
        price,
        quantity: item.quantity,
        lineTotal,
        imageUrl: book.imageUrl || "",
        sellerId: book.sellerId || undefined,
      });
    }

    subtotal = Number(subtotal.toFixed(2));
    const shipping = subtotal >= 100 ? 0 : 5.99;
    const total = Number((subtotal + shipping).toFixed(2));

    const deductedItems: Array<{ bookId: ObjectId; quantity: number }> = [];

    for (const item of snapshotItems) {
      const bookObjectId = new ObjectId(item.bookId);

      const updateResult = await booksCollection.updateOne(
        {
          _id: bookObjectId,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
          $set: { updatedAt: new Date() },
        }
      );

      if (updateResult.modifiedCount === 0) {

        for (const rollback of deductedItems) {
          await booksCollection.updateOne(
            { _id: rollback.bookId },
            { $inc: { stock: rollback.quantity } }
          );
        }

        await idempotencyCollection.deleteOne({ key: idempotencyKey, userId: session.userId });
        return problemResponse(
          409,
          "Inventory Conflict",
          `Inventory for "${item.title}" changed during checkout. The volume is no longer available in the requested quantity.`,
          { instance: request.nextUrl.pathname }
        );
      }

      deductedItems.push({ bookId: bookObjectId, quantity: item.quantity });
    }

    const simulatedPayment = {
      paymentMethod: "simulated_card",
      paymentStatus: "paid",
      isTestOrder: true,
      transactionId: `sim_tx_${crypto.randomBytes(12).toString("hex")}`,
      paidAt: new Date(),
    };

    const orderDoc = {
      ownerId: session.userId,
      items: snapshotItems,
      subtotal,
      shipping,
      total,
      shippingAddress,
      status: "Pending",
      payment: simulatedPayment,
      idempotencyKey,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await ordersCollection.insertOne(orderDoc);
    const orderId = insertResult.insertedId.toString();

    await idempotencyCollection.updateOne(
      { key: idempotencyKey, userId: session.userId },
      {
        $set: {
          status: "completed",
          orderId,
          updatedAt: new Date(),
        },
      }
    );

    await cartsCollection.updateOne(
      { userId: session.userId },
      {
        $set: {
          items: [],
          updatedAt: new Date(),
        },
      }
    );

    return jsonResponse(
      {
        message: "Order placed and confirmed successfully.",
        orderId,
        order: {
          id: orderId,
          ...orderDoc,
        },
      },
      201
    );
  } catch (error) {
    console.error("Error in POST /api/checkout:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "An unexpected failure occurred while finalizing your order.",
      { instance: request.nextUrl.pathname }
    );
  }
}

