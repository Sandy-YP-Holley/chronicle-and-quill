import { NextRequest } from "next/server";
import { z } from "zod";
import { getCollection } from "@/lib/mongodb";
import { jsonResponse, validationErrorResponse, problemResponse } from "@/lib/api-response";
import { parseObjectId } from "@/lib/validators";
import { resolveCartIdentity, enrichCart } from "@/lib/cart-helpers";

const AddToCartRequestSchema = z.object({
  bookId: z.string().trim(),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
});

export async function POST(request: NextRequest) {
  try {
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

    const parseResult = AddToCartRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error, request.nextUrl.pathname);
    }

    const { bookId, quantity } = parseResult.data;

    const bookObjectId = parseObjectId(bookId);
    if (!bookObjectId) {
      return problemResponse(
        404,
        "Book Not Found",
        `Invalid book identifier format: "${bookId}".`,
        { instance: request.nextUrl.pathname }
      );
    }

    const booksCollection = await getCollection("books");
    const book = await booksCollection.findOne({ _id: bookObjectId });

    if (!book) {
      return problemResponse(
        404,
        "Book Not Found",
        "The historical volume could not be found in the archives.",
        { instance: request.nextUrl.pathname }
      );
    }

    if (book.stock <= 0) {
      return problemResponse(
        400,
        "Out of Stock",
        `"${book.title}" is currently out of stock.`,
        { instance: request.nextUrl.pathname }
      );
    }

    const identity = await resolveCartIdentity();
    const cartsCollection = await getCollection("carts");

    const cartQuery = identity.userId
      ? { userId: identity.userId }
      : { sessionId: identity.guestId };

    const existingCart = await cartsCollection.findOne(cartQuery);
    const existingItems = Array.isArray(existingCart?.items) ? existingCart.items : [];

    const existingItemIndex = existingItems.findIndex((item) => item.bookId === bookId);
    let newQuantity = quantity;

    if (existingItemIndex > -1) {
      newQuantity = existingItems[existingItemIndex].quantity + quantity;
    }

    if (newQuantity > book.stock) {
      return problemResponse(
        400,
        "Insufficient Stock",
        `Cannot add ${quantity} more copies. Total requested (${newQuantity}) exceeds available archive stock of ${book.stock}.`,
        { instance: request.nextUrl.pathname }
      );
    }

    if (existingItemIndex > -1) {
      existingItems[existingItemIndex].quantity = newQuantity;
    } else {
      existingItems.push({ bookId, quantity: newQuantity });
    }

    await cartsCollection.updateOne(
      cartQuery,
      {
        $set: {
          ...cartQuery,
          items: existingItems,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    const updatedCart = await cartsCollection.findOne(cartQuery);
    const enriched = await enrichCart(updatedCart);

    return jsonResponse({
      message: `Added ${quantity} volume(s) of "${book.title}" to cart.`,
      cart: enriched,
    });
  } catch (error) {
    console.error("Error in POST /api/cart/add:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "Failed to add item to cart.",
      { instance: request.nextUrl.pathname }
    );
  }
}

