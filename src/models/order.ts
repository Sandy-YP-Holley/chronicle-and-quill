import { z } from "zod";
import { ObjectId } from "mongodb";

export const OrderStatusSchema = z.enum(
  ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
  {
    message: "Order status must be one of: Pending, Confirmed, Shipped, Delivered, Cancelled",
  }
);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderLineItemSchema = z.object({
  bookId: z.string({ message: "Book ID is required" }).min(1, "Book ID is required"),
  title: z.string({ message: "Title is required" }).min(1, "Title is required"),
  price: z.number({ message: "Price is required" }).positive("Price must be a positive number"),
  quantity: z.number({ message: "Quantity is required" }).int("Quantity must be an integer").min(1, "Quantity must be at least 1"),
  imageUrl: z.string().optional(),
  format: z.string().optional(),
  sellerId: z.string().optional(),
});

export type IOrderLineItem = z.infer<typeof OrderLineItemSchema>;

export const ShippingAddressSchema = z.object({
  fullName: z
    .string({ message: "Full recipient name is required" })
    .min(2, "Full recipient name is required and must be at least 2 characters")
    .trim(),
  street: z
    .string({ message: "Street address is required" })
    .min(5, "Street address is required and must be at least 5 characters")
    .trim(),
  city: z
    .string({ message: "City is required" })
    .min(2, "City is required and must be at least 2 characters")
    .trim(),
  postalCode: z
    .string({ message: "Postal or ZIP code is required" })
    .min(3, "Postal or ZIP code is required (min 3 characters)")
    .trim(),
  country: z
    .string({ message: "Country is required" })
    .min(2, "Country is required and must be at least 2 characters")
    .trim(),
});

export type IShippingAddress = z.infer<typeof ShippingAddressSchema>;

export const OrderSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  id: z.string().optional(),
  ownerId: z.string().min(1, "Owner ID is required"),
  items: z.array(OrderLineItemSchema).min(1, "Order must contain at least one item"),
  subtotal: z.number().nonnegative("Subtotal cannot be negative"),
  shipping: z.number().nonnegative("Shipping cannot be negative"),
  total: z.number().nonnegative("Total cannot be negative"),
  shippingAddress: ShippingAddressSchema,
  status: OrderStatusSchema.default("Pending"),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type IOrder = z.infer<typeof OrderSchema>;

export const CreateOrderSchema = z.object({
  items: z
    .array(
      z.object({
        bookId: z.string().min(1, "Book ID is required"),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "Order must contain at least one item"),
  shippingAddress: ShippingAddressSchema,
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
