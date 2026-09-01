import { NextRequest } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { jsonResponse, problemResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return problemResponse(
        401,
        "Unauthorized",
        "Authentication is required to review order history.",
        {
          type: "https://chronicleandquill.com/errors/unauthorized",
          instance: request.nextUrl.pathname,
        }
      );
    }

    const ordersCollection = await getCollection("orders");

    const orders = await ordersCollection
      .find({ ownerId: session.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    const formattedOrders = orders.map((o) => ({
      id: o._id.toString(),
      ownerId: o.ownerId,
      items: o.items,
      subtotal: o.subtotal,
      shipping: o.shipping,
      total: o.total,
      shippingAddress: o.shippingAddress,
      status: o.status,
      payment: o.payment,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    }));

    return jsonResponse({
      orders: formattedOrders,
      totalOrders: formattedOrders.length,
    });
  } catch (error) {
    console.error("Error in GET /api/orders:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "Failed to retrieve your order history.",
      { instance: request.nextUrl.pathname }
    );
  }
}

