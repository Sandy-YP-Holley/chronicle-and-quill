import { NextRequest } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { jsonResponse, problemResponse } from "@/lib/api-response";
import { resolveCartIdentity, enrichCart } from "@/lib/cart-helpers";

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    let bookId = searchParams.get("bookId");

    if (!bookId) {
      try {
        const body = await request.json();
        bookId = body.bookId;
      } catch {

      }
    }

    if (!bookId || typeof bookId !== "string") {
      return problemResponse(
        400,
        "Bad Request",
        "The 'bookId' parameter is required to remove an item from the cart.",
        { instance: request.nextUrl.pathname }
      );
    }

    const identity = await resolveCartIdentity();
    const cartsCollection = await getCollection("carts");

    const cartQuery = identity.userId
      ? { userId: identity.userId }
      : { sessionId: identity.guestId };

    await cartsCollection.updateOne(cartQuery, {
      $pull: { items: { bookId } as never },
      $set: { updatedAt: new Date() },
    });

    const updatedCart = await cartsCollection.findOne(cartQuery);
    const enriched = await enrichCart(updatedCart);

    return jsonResponse({
      message: "Item removed from cart.",
      cart: enriched,
    });
  } catch (error) {
    console.error("Error in DELETE /api/cart/remove:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "Failed to remove item from cart.",
      { instance: request.nextUrl.pathname }
    );
  }
}

