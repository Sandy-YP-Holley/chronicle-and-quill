import { NextRequest } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { jsonResponse, problemResponse } from "@/lib/api-response";
import { parseObjectId } from "@/lib/validators";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const objectId = parseObjectId(id);
    if (!objectId) {
      return problemResponse(
        404,
        "Book Not Found",
        `The requested volume identifier "${id}" is malformed or invalid.`,
        {
          type: "https://chronicleandquill.com/errors/not-found",
          instance: request.nextUrl.pathname,
        }
      );
    }

    const booksCollection = await getCollection("books");
    const book = await booksCollection.findOne({ _id: objectId });

    if (!book) {
      return problemResponse(
        404,
        "Book Not Found",
        "No historical volume matching the provided identifier was found in the archive.",
        {
          type: "https://chronicleandquill.com/errors/not-found",
          instance: request.nextUrl.pathname,
        }
      );
    }

    return jsonResponse({
      book: {
        id: book._id.toString(),
        title: book.title,
        authors: book.authors,
        period: book.period,
        subjects: book.subjects,
        description: book.description,
        isbn: book.isbn,
        format: book.format,
        price: book.price,
        stock: book.stock,
        imageUrl: book.imageUrl,
        pages: book.pages,
        publisher: book.publisher,
        publicationYear: book.publicationYear,
        featured: book.featured,
        rating: book.rating,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/books/[id]:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "An unexpected error occurred while retrieving the book details.",
      { instance: request.nextUrl.pathname }
    );
  }
}

