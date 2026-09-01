import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { parseObjectId } from "@/lib/validators";
import { jsonResponse, validationErrorResponse, problemResponse } from "@/lib/api-response";
import { OrderStatusSchema } from "@/models/order";
import { z } from "zod";

const UpdateOrderStatusSchema = z.object({
  status: OrderStatusSchema,
});

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
        "Administrative session required.",
        { instance: request.nextUrl.pathname }
      );
    }

    if (session.role !== "admin") {
      return problemResponse(
        403,
        "Forbidden",
        "Curatorial Overseer privileges required to update order statuses.",
        { instance: request.nextUrl.pathname }
      );
    }

    const { id } = await params;
    const orderObjectId = parseObjectId(id);

    if (!orderObjectId) {
      return problemResponse(
        404,
        "Order Not Found",
        `Invalid order identifier "${id}".`,
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
        "Invalid JSON payload supplied.",
        { instance: request.nextUrl.pathname }
      );
    }

    const parseResult = UpdateOrderStatusSchema.safeParse(body);
    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error, request.nextUrl.pathname);
    }

    const { status: newStatus } = parseResult.data;
    const ordersCollection = await getCollection("orders");
    const existingOrder = await ordersCollection.findOne({ _id: orderObjectId });

    if (!existingOrder) {
      return problemResponse(
        404,
        "Order Not Found",
        `No order found with ID "${id}".`,
        { instance: request.nextUrl.pathname }
      );
    }

    const currentStatus = existingOrder.status;

    if (currentStatus === "Cancelled" || currentStatus === "Delivered") {
      return problemResponse(
        400,
        "Terminal State Violation",
        `Cannot modify order "${id}" because it is in a terminal "${currentStatus}" state.`,
        { instance: request.nextUrl.pathname }
      );
    }

    if (newStatus === "Cancelled" && (currentStatus === "Pending" || currentStatus === "Confirmed")) {
      const booksCollection = await getCollection("books");
      for (const item of existingOrder.items) {
        const bookObjectId = parseObjectId(item.bookId);
        if (bookObjectId) {
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
          status: newStatus,
          updatedAt: new Date(),
        },
      }
    );

    const updatedOrder = await ordersCollection.findOne({ _id: orderObjectId });

    return jsonResponse({
      message: `Order status successfully transitioned from "${currentStatus}" to "${newStatus}".`,
      order: {
        id: updatedOrder!._id.toString(),
        ...updatedOrder,
      },
    });
  } catch (error) {
    console.error("Error in PATCH /api/admin/orders/[id]/status:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "Failed to update order status.",
      { instance: request.nextUrl.pathname }
    );
  }
}
