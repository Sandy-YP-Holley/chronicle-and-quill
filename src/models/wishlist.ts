import { z } from "zod";
import { ObjectId } from "mongodb";

export const WishlistSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  id: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
  bookIds: z
    .array(z.union([z.instanceof(ObjectId), z.string()]))
    .default([]),
  updatedAt: z.date().default(() => new Date()),
});

export type IWishlist = z.infer<typeof WishlistSchema>;

export const ToggleWishlistSchema = z.object({
  bookId: z.string().min(1, "Book ID is required"),
});

export type ToggleWishlistInput = z.infer<typeof ToggleWishlistSchema>;

