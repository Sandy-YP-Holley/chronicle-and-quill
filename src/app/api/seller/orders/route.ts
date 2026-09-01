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
        "Authentication required to view seller sales records.",
        { instance: request.nextUrl.pathname }
      );
    }

    if (session.role !== "seller" && session.role !== "admin") {
      return problemResponse(
        403,
        "Forbidden",
        "Archival Seller privileges required to access sales ledger.",
        { instance: request.nextUrl.pathname }
      );
    }

    const ordersCollection = await getCollection("orders");
    const sellerOrders = await ordersCollection
      .find({ "items.sellerId": session.userId })
      .sort({ createdAt: -1 })
      .toArray();

    let totalUnitsSold = 0;
    let totalSalesVolume = 0;

    const formattedOrders = sellerOrders.map((order) => {
      const sellerItems = order.items.filter((item: { sellerId?: string }) => item.sellerId === session.userId);
      const sellerSubtotal = sellerItems.reduce(
        (sum: number, it: { price: number; quantity: number }) => sum + it.price * it.quantity,
        0
      );

      sellerItems.forEach((it: { quantity: number }) => {
        totalUnitsSold += it.quantity;
      });

      if (order.status !== "Cancelled") {
        totalSalesVolume += sellerSubtotal;
      }

      return {
        id: order._id.toString(),
        status: order.status,
        createdAt: order.createdAt,
        shippingAddress: {
          city: order.shippingAddress.city,
          country: order.shippingAddress.country,
        },
        items: sellerItems,
        sellerTotal: Number(sellerSubtotal.toFixed(2)),
      };
    });

    return jsonResponse({
      orders: formattedOrders,
      stats: {
        totalOrders: formattedOrders.length,
        totalUnitsSold,
        totalSalesVolume: Number(totalSalesVolume.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Error in GET /api/seller/orders:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "Failed to retrieve seller sales ledger.",
      { instance: request.nextUrl.pathname }
    );
  }
}
