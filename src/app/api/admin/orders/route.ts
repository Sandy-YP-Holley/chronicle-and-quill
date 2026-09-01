import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { jsonResponse, problemResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
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
        "Curatorial Overseer privileges required to view all platform orders.",
        { instance: request.nextUrl.pathname }
      );
    }

    const ordersCollection = await getCollection("orders");
    const allOrders = await ordersCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const formattedOrders = allOrders.map((order) => ({
      id: order._id.toString(),
      ownerId: order.ownerId,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      shippingAddress: order.shippingAddress,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    return jsonResponse({
      orders: formattedOrders,
      count: formattedOrders.length,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/orders:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "Failed to retrieve platform orders.",
      { instance: request.nextUrl.pathname }
    );
  }
}
