import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { jsonResponse, validationErrorResponse, problemResponse } from "@/lib/api-response";
import { CreateBookSchema } from "@/models/book";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return problemResponse(
        401,
        "Unauthorized",
        "Authentication required to view seller inventory.",
        { instance: request.nextUrl.pathname }
      );
    }

    if (session.role !== "seller" && session.role !== "admin") {
      return problemResponse(
        403,
        "Forbidden",
        "Archival Seller credentials required to view this inventory.",
        { instance: request.nextUrl.pathname }
      );
    }

    const booksCollection = await getCollection("books");
    const sellerBooks = await booksCollection
      .find({ sellerId: session.userId })
      .sort({ createdAt: -1 })
      .toArray();

    const items = sellerBooks.map((doc) => ({
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
      sellerName: doc.sellerName,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    return jsonResponse({
      items,
      count: items.length,
    });
  } catch (error) {
    console.error("Error in GET /api/seller/books:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "Failed to retrieve seller inventory.",
      { instance: request.nextUrl.pathname }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return problemResponse(
        401,
        "Unauthorized",
        "Authentication required to list rare manuscripts.",
        { instance: request.nextUrl.pathname }
      );
    }

    if (session.role !== "seller" && session.role !== "admin") {
      return problemResponse(
        403,
        "Forbidden",
        "Archival Seller privileges required to add books to the catalog.",
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

    const parseResult = CreateBookSchema.safeParse(body);
    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error, request.nextUrl.pathname);
    }

    const bookData = parseResult.data;
    const booksCollection = await getCollection("books");

    const existingIsbn = await booksCollection.findOne({ isbn: bookData.isbn.trim() });
    if (existingIsbn) {
      return problemResponse(
        409,
        "Duplicate ISBN",
        `A manuscript with ISBN "${bookData.isbn}" is already registered in the archives.`,
        { instance: request.nextUrl.pathname }
      );
    }

    const now = new Date();
    const newBookDoc = {
      ...bookData,
      isbn: bookData.isbn.trim(),
      sellerId: session.userId,
      sellerName: session.sellerName || session.name || "Archival Seller",
      isDelisted: false,
      createdAt: now,
      updatedAt: now,
    };

    const insertResult = await booksCollection.insertOne(newBookDoc);
    const bookId = insertResult.insertedId.toString();

    return jsonResponse(
      {
        message: "Rare manuscript successfully cataloged into the Archival Stacks.",
        book: {
          id: bookId,
          ...newBookDoc,
        },
      },
      201
    );
  } catch (error) {
    console.error("Error in POST /api/seller/books:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "Failed to catalog manuscript.",
      { instance: request.nextUrl.pathname }
    );
  }
}
