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
        "Curatorial Overseer privileges required to view platform metrics.",
        { instance: request.nextUrl.pathname }
      );
    }

    const booksCollection = await getCollection("books");
    const usersCollection = await getCollection("users");
    const ordersCollection = await getCollection("orders");

    const totalBooks = await booksCollection.countDocuments({ isDelisted: { $ne: true } });
    const totalUsers = await usersCollection.countDocuments();
    const totalSellers = await usersCollection.countDocuments({ role: "seller" });
    const totalOrders = await ordersCollection.countDocuments();

    const revenueResult = await ordersCollection
      .aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
      ])
      .toArray();

    const grossVolume = revenueResult.length > 0 ? Number(revenueResult[0].totalRevenue.toFixed(2)) : 0;

    return jsonResponse({
      metrics: {
        totalBooks,
        totalUsers,
        totalSellers,
        totalOrders,
        grossVolume,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/admin/metrics:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "Failed to calculate platform metrics.",
      { instance: request.nextUrl.pathname }
    );
  }
}
