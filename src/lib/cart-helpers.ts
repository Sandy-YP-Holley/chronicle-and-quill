import { cookies } from "next/headers";
import crypto from "crypto";
import { ObjectId } from "mongodb";
import { getCollection } from "./mongodb";
import { parseObjectId } from "./validators";
import { getSession } from "./auth";

export const GUEST_COOKIE_NAME = "cq_guest_id";
const GUEST_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

export interface EnrichedCartItem {
  bookId: string;
  title: string;
  authors: string[];
  format: string;
  price: number;
  stock: number;
  quantity: number;
  lineTotal: number;
  imageUrl: string;
  isAvailable: boolean;
}

export interface EnrichedCart {
  id?: string;
  userId?: string;
  guestId?: string;
  items: EnrichedCartItem[];
  subtotal: number;
  totalItems: number;
  shipping: number;
  total: number;
  updatedAt: Date;
}

export async function getOrCreateGuestId(): Promise<{ guestId: string; isNew: boolean }> {
  const cookieStore = await cookies();
  const existingCookie = cookieStore.get(GUEST_COOKIE_NAME);

  if (existingCookie?.value) {
    return { guestId: existingCookie.value, isNew: false };
  }

  const newGuestId = `guest_${crypto.randomUUID()}`;
  cookieStore.set(GUEST_COOKIE_NAME, newGuestId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GUEST_COOKIE_MAX_AGE,
  });

  return { guestId: newGuestId, isNew: true };
}

export async function resolveCartIdentity(): Promise<{
  userId?: string;
  guestId?: string;
}> {
  const session = await getSession();
  if (session?.userId) {
    return { userId: session.userId };
  }

  const { guestId } = await getOrCreateGuestId();
  return { guestId };
}

export async function enrichCart(
  cartDoc: {
    _id?: ObjectId;
    userId?: string;
    sessionId?: string;
    items?: Array<{ bookId: string; quantity: number }>;
    updatedAt?: Date;
  } | null
): Promise<EnrichedCart> {
  const emptyCart: EnrichedCart = {
    items: [],
    subtotal: 0,
    totalItems: 0,
    shipping: 0,
    total: 0,
    updatedAt: new Date(),
  };

  if (!cartDoc || !cartDoc.items || cartDoc.items.length === 0) {
    return emptyCart;
  }

  const booksCollection = await getCollection("books");
  const bookObjectIds = cartDoc.items
    .map((item) => parseObjectId(item.bookId))
    .filter((id): id is ObjectId => id !== null);

  const books = await booksCollection
    .find({ _id: { $in: bookObjectIds } })
    .toArray();

  const booksMap = new Map(books.map((b) => [b._id.toString(), b]));

  const enrichedItems: EnrichedCartItem[] = [];
  let subtotal = 0;
  let totalItems = 0;

  for (const item of cartDoc.items) {
    const book = booksMap.get(item.bookId);
    if (!book) {

      continue;
    }

    const price = typeof book.price === "number" ? book.price : 0;
    const stock = typeof book.stock === "number" ? book.stock : 0;
    const quantity = Math.max(1, Math.min(item.quantity, Math.max(1, stock)));
    const lineTotal = Number((price * quantity).toFixed(2));
    const isAvailable = stock >= quantity;

    enrichedItems.push({
      bookId: item.bookId,
      title: book.title || "Historical Volume",
      authors: Array.isArray(book.authors) ? book.authors : [],
      format: book.format || "Hardcover",
      price,
      stock,
      quantity,
      lineTotal,
      imageUrl: book.imageUrl || "",
      isAvailable,
    });

    subtotal += lineTotal;
    totalItems += quantity;
  }

  subtotal = Number(subtotal.toFixed(2));

  const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 5.99;
  const total = Number((subtotal + shipping).toFixed(2));

  return {
    id: cartDoc._id?.toString(),
    userId: cartDoc.userId,
    guestId: cartDoc.sessionId,
    items: enrichedItems,
    subtotal,
    totalItems,
    shipping,
    total,
    updatedAt: cartDoc.updatedAt || new Date(),
  };
}

export async function mergeGuestCartIntoUserCart(
  guestId: string,
  userId: string
): Promise<void> {
  const cartsCollection = await getCollection("carts");
  const booksCollection = await getCollection("books");

  const guestCart = await cartsCollection.findOne({ sessionId: guestId });
  if (!guestCart || !guestCart.items || guestCart.items.length === 0) {
    return;
  }

  const userCart = await cartsCollection.findOne({ userId });
  const mergedItemsMap = new Map<string, number>();

  if (userCart && Array.isArray(userCart.items)) {
    for (const item of userCart.items) {
      mergedItemsMap.set(item.bookId, item.quantity);
    }
  }

  for (const guestItem of guestCart.items) {
    const bookObjectId = parseObjectId(guestItem.bookId);
    if (!bookObjectId) continue;

    const book = await booksCollection.findOne({ _id: bookObjectId });
    if (!book || book.stock <= 0) continue;

    const currentQty = mergedItemsMap.get(guestItem.bookId) || 0;
    const combinedQty = Math.min(currentQty + guestItem.quantity, book.stock);
    mergedItemsMap.set(guestItem.bookId, combinedQty);
  }

  const finalItems = Array.from(mergedItemsMap.entries()).map(([bookId, quantity]) => ({
    bookId,
    quantity,
  }));

  await cartsCollection.updateOne(
    { userId },
    {
      $set: {
        userId,
        items: finalItems,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  await cartsCollection.deleteOne({ sessionId: guestId });

  const cookieStore = await cookies();
  cookieStore.delete(GUEST_COOKIE_NAME);
}

