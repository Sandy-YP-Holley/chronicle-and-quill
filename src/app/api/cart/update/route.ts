import { NextRequest } from "next/server";
import { z } from "zod";
import { getCollection } from "@/lib/mongodb";
import { jsonResponse, validationErrorResponse, problemResponse } from "@/lib/api-response";
import { parseObjectId } from "@/lib/validators";
import { resolveCartIdentity, enrichCart } from "@/lib/cart-helpers";

const UpdateCartSchema = z.object({
  bookId: z.string().trim(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export async function PATCH(request: NextRequest) {
  try {
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

    const parseResult = UpdateCartSchema.safeParse(body);
    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error, request.nextUrl.pathname);
    }

    const { bookId, quantity } = parseResult.data;

    const bookObjectId = parseObjectId(bookId);
    if (!bookObjectId) {
      return problemResponse(
        404,
        "Book Not Found",
        `Invalid book identifier format: "${bookId}".`,
        { instance: request.nextUrl.pathname }
      );
    }

    const booksCollection = await getCollection("books");
    const book = await booksCollection.findOne({ _id: bookObjectId });

    if (!book) {
      return problemResponse(
        404,
        "Book Not Found",
        "The historical volume could not be found in the archives.",
        { instance: request.nextUrl.pathname }
      );
    }

    if (quantity > book.stock) {
      return problemResponse(
        400,
        "Insufficient Stock",
        `Cannot update quantity to ${quantity}. Maximum available stock is ${book.stock}.`,
        { instance: request.nextUrl.pathname }
      );
    }

    const identity = await resolveCartIdentity();
    const cartsCollection = await getCollection("carts");

    const cartQuery = identity.userId
      ? { userId: identity.userId }
      : { sessionId: identity.guestId };

    const cart = await cartsCollection.findOne(cartQuery);
    if (!cart || !Array.isArray(cart.items)) {
      return problemResponse(
        404,
        "Cart Not Found",
        "No active cart found for this session.",
        { instance: request.nextUrl.pathname }
      );
    }

    const itemIndex = cart.items.findIndex((item: { bookId: string }) => item.bookId === bookId);
    if (itemIndex === -1) {
      return problemResponse(
        404,
        "Item Not In Cart",
        "The specified book is not present in your cart.",
        { instance: request.nextUrl.pathname }
      );
    }

    cart.items[itemIndex].quantity = quantity;

    await cartsCollection.updateOne(
      cartQuery,
      {
        $set: {
          items: cart.items,
          updatedAt: new Date(),
        },
      }
    );

    const updatedCart = await cartsCollection.findOne(cartQuery);
    const enriched = await enrichCart(updatedCart);

    return jsonResponse({
      message: "Cart updated successfully.",
      cart: enriched,
    });
  } catch (error) {
    console.error("Error in PATCH /api/cart/update:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "Failed to update cart item quantity.",
      { instance: request.nextUrl.pathname }
    );
  }
}

