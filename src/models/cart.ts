import { z } from "zod";
import { ObjectId } from "mongodb";

export const CartItemSchema = z.object({
  bookId: z.string().min(1, "Book ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export type ICartItem = z.infer<typeof CartItemSchema>;

export const CartSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  id: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  items: z.array(CartItemSchema).default([]),
  updatedAt: z.date().default(() => new Date()),
}).refine((data) => data.userId || data.sessionId, {
  message: "Either userId or sessionId must be provided for a cart",
});

export type ICart = z.infer<typeof CartSchema>;

export const AddToCartSchema = z.object({
  bookId: z.string().min(1, "Book ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
});

export type AddToCartInput = z.infer<typeof AddToCartSchema>;

