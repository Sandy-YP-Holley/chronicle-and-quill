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
        "Curatorial Overseer privileges required to inspect catalog records.",
        { instance: request.nextUrl.pathname }
      );
    }

    const booksCollection = await getCollection("books");
    const allBooks = await booksCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const items = allBooks.map((doc) => ({
      id: doc._id.toString(),
      title: doc.title,
      authors: doc.authors,
      period: doc.period,
      subjects: doc.subjects,
      description: doc.description,
      isbn: doc.isbn,
      format: doc.format,
      price: doc.price,
      stock: doc.stock,
      imageUrl: doc.imageUrl,
      pages: doc.pages,
      publisher: doc.publisher,
      publicationYear: doc.publicationYear,
      featured: doc.featured,
      rating: doc.rating,
      isDelisted: doc.isDelisted ?? false,
      sellerId: doc.sellerId,
      sellerName: doc.sellerName || "Chronicle & Quill Central Archive",
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    return jsonResponse({
      items,
      count: items.length,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/books:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "Failed to retrieve catalog records.",
      { instance: request.nextUrl.pathname }
    );
  }
}
