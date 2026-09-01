import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { parseObjectId } from "@/lib/validators";
import { jsonResponse, validationErrorResponse, problemResponse } from "@/lib/api-response";
import { UpdateBookSchema } from "@/models/book";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return problemResponse(
        401,
        "Unauthorized",
        "Authentication required to modify book inventory.",
        { instance: request.nextUrl.pathname }
      );
    }

    if (session.role !== "seller" && session.role !== "admin") {
      return problemResponse(
        403,
        "Forbidden",
        "Seller privileges required to modify this listing.",
        { instance: request.nextUrl.pathname }
      );
    }

    const { id } = await params;
    const bookObjectId = parseObjectId(id);

    if (!bookObjectId) {
      return problemResponse(
        404,
        "Book Not Found",
        `Invalid book identifier "${id}".`,
        { instance: request.nextUrl.pathname }
      );
    }

    const booksCollection = await getCollection("books");
    const existingBook = await booksCollection.findOne({ _id: bookObjectId });

    if (!existingBook) {
      return problemResponse(
        404,
        "Book Not Found",
        `No book found with ID "${id}".`,
        { instance: request.nextUrl.pathname }
      );
    }

    if (existingBook.sellerId !== session.userId && session.role !== "admin") {
      return problemResponse(
        403,
        "Forbidden",
        "Anti-BOLA Protection: You are not authorized to modify manuscripts listed by another archivist.",
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

    const parseResult = UpdateBookSchema.safeParse(body);
    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error, request.nextUrl.pathname);
    }

    const updateData = parseResult.data;

    await booksCollection.updateOne(
      { _id: bookObjectId },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    const updatedBook = await booksCollection.findOne({ _id: bookObjectId });

    return jsonResponse({
      message: "Manuscript listing updated successfully.",
      book: {
        id: updatedBook!._id.toString(),
        ...updatedBook,
      },
    });
  } catch (error) {
    console.error("Error in PATCH /api/seller/books/[id]:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "Failed to update manuscript listing.",
      { instance: request.nextUrl.pathname }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return problemResponse(
        401,
        "Unauthorized",
        "Authentication required to remove book from archives.",
        { instance: request.nextUrl.pathname }
      );
    }

    if (session.role !== "seller" && session.role !== "admin") {
      return problemResponse(
        403,
        "Forbidden",
        "Seller privileges required to remove this listing.",
        { instance: request.nextUrl.pathname }
      );
    }

    const { id } = await params;
    const bookObjectId = parseObjectId(id);

    if (!bookObjectId) {
      return problemResponse(
        404,
        "Book Not Found",
        `Invalid book identifier "${id}".`,
        { instance: request.nextUrl.pathname }
      );
    }

    const booksCollection = await getCollection("books");
    const existingBook = await booksCollection.findOne({ _id: bookObjectId });

    if (!existingBook) {
      return problemResponse(
        404,
        "Book Not Found",
        `No book found with ID "${id}".`,
        { instance: request.nextUrl.pathname }
      );
    }

    if (existingBook.sellerId !== session.userId && session.role !== "admin") {
      return problemResponse(
        403,
        "Forbidden",
        "Anti-BOLA Protection: You cannot delist volumes owned by another archivist.",
        { instance: request.nextUrl.pathname }
      );
    }

    const ordersCollection = await getCollection("orders");
    const hasOrders = await ordersCollection.findOne({ "items.bookId": id });

    if (hasOrders) {
      await booksCollection.updateOne(
        { _id: bookObjectId },
        {
          $set: {
            isDelisted: true,
            stock: 0,
            updatedAt: new Date(),
          },
        }
      );

      return jsonResponse({
        message: "Manuscript has historical order records; soft-delisted to preserve referential integrity.",
        delisted: true,
        purged: false,
      });
    }

    await booksCollection.deleteOne({ _id: bookObjectId });

    return jsonResponse({
      message: "Manuscript successfully removed from the Archival Stacks.",
      delisted: true,
      purged: true,
    });
  } catch (error) {
    console.error("Error in DELETE /api/seller/books/[id]:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "Failed to delist manuscript.",
      { instance: request.nextUrl.pathname }
    );
  }
}
