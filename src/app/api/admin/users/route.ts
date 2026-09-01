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
        "Curatorial Overseer privileges required to view user directory.",
        { instance: request.nextUrl.pathname }
      );
    }

    const usersCollection = await getCollection("users");
    const users = await usersCollection
      .find({}, { projection: { passwordHash: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    const safeUsers = users.map((doc) => {
      const rawRole = doc.role || "buyer";
      const normalizedRole = rawRole === "customer" ? "buyer" : rawRole;

      return {
        id: doc._id.toString(),
        email: doc.email,
        name: doc.name || "Guild Scholar",
        role: normalizedRole,
        sellerName: doc.sellerName,
        sellerBio: doc.sellerBio,
        specialtyEra: doc.specialtyEra,
        isApprovedSeller: doc.isApprovedSeller ?? false,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    });

    return jsonResponse({
      users: safeUsers,
      count: safeUsers.length,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "Failed to retrieve user directory.",
      { instance: request.nextUrl.pathname }
    );
  }
}
