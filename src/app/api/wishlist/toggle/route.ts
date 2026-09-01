import { NextRequest } from "next/server";
import { z } from "zod";
import { getCollection } from "@/lib/mongodb";
import { jsonResponse, validationErrorResponse, problemResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { parseObjectId } from "@/lib/validators";

const ToggleWishlistSchema = z.object({
  bookId: z.string().trim(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return problemResponse(
        401,
        "Unauthorized",
        "Authentication is required to modify your wishlist.",
        {
          type: "https://chronicleandquill.com/errors/unauthorized",
          instance: request.nextUrl.pathname,
        }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return problemResponse(
        400,
        "Bad Request",
        "Invalid JSON payload supplied in request body.",
        { instance: request.nextUrl.pathname }
      );
    }

    const parseResult = ToggleWishlistSchema.safeParse(body);
    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error, request.nextUrl.pathname);
    }

    const { bookId } = parseResult.data;
    const bookObjectId = parseObjectId(bookId);
    if (!bookObjectId) {
      return problemResponse(
        404,
        "Book Not Found",
        `Invalid book identifier: "${bookId}".`,
        { instance: request.nextUrl.pathname }
      );
    }

    const booksCollection = await getCollection("books");
    const book = await booksCollection.findOne({ _id: bookObjectId });
    if (!book) {
      return problemResponse(
        404,
        "Book Not Found",
        "The historical volume does not exist in the archive.",
        { instance: request.nextUrl.pathname }
      );
    }

    const wishlistsCollection = await getCollection("wishlists");
    const wishlist = await wishlistsCollection.findOne({ userId: session.userId });

    const existingBookIds: string[] = Array.isArray(wishlist?.bookIds)
      ? wishlist.bookIds.map((id: unknown) => String(id))
      : [];

    const isAlreadyInWishlist = existingBookIds.includes(bookId);

    if (isAlreadyInWishlist) {
      await wishlistsCollection.updateOne(
        { userId: session.userId },
        {
          $pull: { bookIds: bookId as never },
          $set: { updatedAt: new Date() },
        }
      );

      return jsonResponse({
        bookId,
        inWishlist: false,
        message: `Removed "${book.title}" from your wishlist.`,
      });
    } else {
      await wishlistsCollection.updateOne(
        { userId: session.userId },
        {
          $addToSet: { bookIds: bookId as never },
          $set: { updatedAt: new Date() },
          $setOnInsert: { userId: session.userId },
        },
        { upsert: true }
      );

      return jsonResponse({
        bookId,
        inWishlist: true,
        message: `Added "${book.title}" to your wishlist.`,
      });
    }
  } catch (error) {
    console.error("Error in POST /api/wishlist/toggle:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "Failed to update wishlist.",
      { instance: request.nextUrl.pathname }
    );
  }
}

