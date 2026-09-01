import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/mongodb";
import { jsonResponse, problemResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { parseObjectId } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return problemResponse(
        401,
        "Unauthorized",
        "Authentication is required to view your curated archival wishlist.",
        {
          type: "https://chronicleandquill.com/errors/unauthorized",
          instance: request.nextUrl.pathname,
        }
      );
    }

    const wishlistsCollection = await getCollection("wishlists");
    const booksCollection = await getCollection("books");

    const wishlist = await wishlistsCollection.findOne({ userId: session.userId });
    const bookIds = Array.isArray(wishlist?.bookIds) ? wishlist.bookIds : [];

    const objectIds = bookIds
      .map((id: string | ObjectId) => (id instanceof ObjectId ? id : parseObjectId(String(id))))
      .filter((id): id is ObjectId => id !== null);

    const books = await booksCollection
      .find({ _id: { $in: objectIds } })
      .toArray();

    const items = books.map((b) => ({
      id: b._id.toString(),
      title: b.title,
      authors: b.authors,
      period: b.period,
      format: b.format,
      price: b.price,
      stock: b.stock,
      imageUrl: b.imageUrl,
      rating: b.rating,
    }));

    return jsonResponse({
      wishlist: {
        userId: session.userId,
        items,
        totalItems: items.length,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/wishlist:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "Failed to retrieve wishlist.",
      { instance: request.nextUrl.pathname }
    );
  }
}

