import { NextRequest } from "next/server";
import { z } from "zod";
import { getCollection } from "@/lib/mongodb";
import { jsonResponse, validationErrorResponse, problemResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { parseObjectId } from "@/lib/validators";
import { OrderStatusSchema, OrderStatus } from "@/models/order";

const UpdateOrderStatusSchema = z.object({
  status: OrderStatusSchema,
  reason: z.string().trim().max(200).optional(),
});

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Shipped", "Cancelled"],
  Shipped: ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return problemResponse(
        401,
        "Unauthorized",
        "Authentication is required to update an order.",
        {
          type: "https://chronicleandquill.com/errors/unauthorized",
          instance: request.nextUrl.pathname,
        }
      );
    }

    const { id } = await params;
    const orderObjectId = parseObjectId(id);
    if (!orderObjectId) {
      return problemResponse(
        404,
        "Order Not Found",
        `Invalid order identifier format: "${id}".`,
        { instance: request.nextUrl.pathname }
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

    const parseResult = UpdateOrderStatusSchema.safeParse(body);
    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error, request.nextUrl.pathname);
    }

    const { status: targetStatus, reason } = parseResult.data;

    const ordersCollection = await getCollection("orders");
    const booksCollection = await getCollection("books");

    const order = await ordersCollection.findOne({ _id: orderObjectId });
    if (!order) {
      return problemResponse(
        404,
        "Order Not Found",
        "No historical order matching the requested identifier was found.",
        { instance: request.nextUrl.pathname }
      );
    }

    const currentStatus = order.status as OrderStatus;
    const isOwner = order.ownerId === session.userId;
    const isAdmin = session.role === "admin";

    if (!isOwner && !isAdmin) {
      return problemResponse(
        403,
        "Forbidden",
        "You do not possess authorization to modify this order.",
        {
          type: "https://chronicleandquill.com/errors/forbidden",
          instance: request.nextUrl.pathname,
        }
      );
    }

    const allowedNextStates = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowedNextStates.includes(targetStatus)) {
      return problemResponse(
        400,
        "Invalid State Transition",
        `Cannot transition order status from "${currentStatus}" to "${targetStatus}". Allowed next transitions: [${allowedNextStates.join(", ") || "None (Terminal state)"}].`,
        { instance: request.nextUrl.pathname }
      );
    }

    if (!isAdmin && isOwner) {
      if (targetStatus !== "Cancelled") {
        return problemResponse(
          403,
          "Forbidden",
          "Customers may only request order cancellation. Administrative status modifications require elevated privileges.",
          { instance: request.nextUrl.pathname }
        );
      }

      if (currentStatus !== "Pending") {
        return problemResponse(
          400,
          "Invalid State Transition",
          `Orders in "${currentStatus}" status cannot be cancelled by customer. Please contact curator support.`,
          { instance: request.nextUrl.pathname }
        );
      }
    }

    if (targetStatus === "Cancelled" && Array.isArray(order.items)) {
      for (const item of order.items) {
        const bookObjectId = parseObjectId(item.bookId);
        if (bookObjectId && typeof item.quantity === "number") {
          await booksCollection.updateOne(
            { _id: bookObjectId },
            {
              $inc: { stock: item.quantity },
              $set: { updatedAt: new Date() },
            }
          );
        }
      }
    }

    await ordersCollection.updateOne(
      { _id: orderObjectId },
      {
        $set: {
          status: targetStatus,
          cancellationReason: targetStatus === "Cancelled" ? reason || "User requested" : undefined,
          updatedAt: new Date(),
        },
      }
    );

    return jsonResponse({
      message: `Order status updated to "${targetStatus}".`,
      orderId: id,
      previousStatus: currentStatus,
      newStatus: targetStatus,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error in PATCH /api/orders/[id]/status:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "Failed to update order status.",
      { instance: request.nextUrl.pathname }
    );
  }
}

