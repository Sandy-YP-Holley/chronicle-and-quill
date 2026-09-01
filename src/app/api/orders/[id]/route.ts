import { NextRequest } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { jsonResponse, problemResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { parseObjectId } from "@/lib/validators";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return problemResponse(
        401,
        "Unauthorized",
        "Authentication is required to view order details.",
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

    const ordersCollection = await getCollection("orders");
    const order = await ordersCollection.findOne({ _id: orderObjectId });

    if (!order) {
      return problemResponse(
        404,
        "Order Not Found",
        "No historical order matching the requested identifier was found.",
        { instance: request.nextUrl.pathname }
      );
    }

    const isOwner = order.ownerId === session.userId;
    const isAdmin = session.role === "admin";

    if (!isOwner && !isAdmin) {
      return problemResponse(
        403,
        "Forbidden",
        "You do not possess authorization to examine this archival order.",
        {
          type: "https://chronicleandquill.com/errors/forbidden",
          instance: request.nextUrl.pathname,
        }
      );
    }

    return jsonResponse({
      order: {
        id: order._id.toString(),
        ownerId: order.ownerId,
        items: order.items,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        shippingAddress: order.shippingAddress,
        status: order.status,
        payment: order.payment,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/orders/[id]:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "An unexpected failure occurred while retrieving the order.",
      { instance: request.nextUrl.pathname }
    );
  }
}

