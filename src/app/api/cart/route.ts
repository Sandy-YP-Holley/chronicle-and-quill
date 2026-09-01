import { NextRequest } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { jsonResponse, problemResponse } from "@/lib/api-response";
import { resolveCartIdentity, enrichCart } from "@/lib/cart-helpers";

export async function GET(request: NextRequest) {
  try {
    const identity = await resolveCartIdentity();
    const cartsCollection = await getCollection("carts");

    const query = identity.userId
      ? { userId: identity.userId }
      : { sessionId: identity.guestId };

    const cartDoc = await cartsCollection.findOne(query);
    const enriched = await enrichCart(cartDoc);

    return jsonResponse({
      cart: enriched,
    });
  } catch (error) {
    console.error("Error in GET /api/cart:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "Failed to retrieve shopping cart.",
      { instance: request.nextUrl.pathname }
    );
  }
}

