import { z } from "zod";
import { ObjectId } from "mongodb";

export const HistoricalPeriodSchema = z.enum(
  ["Antiquity", "Medieval", "Early Modern", "20th Century"],
  {
    message: "Historical epoch must be one of: Antiquity, Medieval, Early Modern, 20th Century",
  }
);
export type HistoricalPeriod = z.infer<typeof HistoricalPeriodSchema>;

export const BookFormatSchema = z.enum(
  ["Hardcover", "Leather-bound", "Paperback", "Archival Reprint"],
  {
    message: "Binding format must be one of: Hardcover, Leather-bound, Paperback, Archival Reprint",
  }
);
export type BookFormat = z.infer<typeof BookFormatSchema>;

export const BookSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  id: z.string().optional(),
  title: z
    .string({ message: "Title is required" })
    .min(2, "Title is required and must be between 2 and 200 characters")
    .max(200, "Title is required and must be between 2 and 200 characters")
    .trim(),
  authors: z
    .array(z.string().min(1, "Author name cannot be blank").trim(), {
      message: "At least one author is required",
    })
    .min(1, "At least one author is required"),
  period: HistoricalPeriodSchema,
  subjects: z
    .array(z.string().min(1, "Subject category tag cannot be blank").trim(), {
      message: "At least one subject category tag is required",
    })
    .min(1, "At least one subject category tag is required"),
  description: z
    .string({ message: "Bibliographical description is required" })
    .min(10, "Bibliographical description is required and must be between 10 and 5,000 characters")
    .max(5000, "Bibliographical description cannot exceed 5,000 characters")
    .trim(),
  isbn: z
    .string({ message: "ISBN standard identifier is required" })
    .min(10, "ISBN must be a valid 10 or 13-character standard book identifier (e.g., 978-0140449082)")
    .max(17, "ISBN cannot exceed 17 characters")
    .trim(),
  format: BookFormatSchema,
  price: z
    .number({ message: "Price is required" })
    .min(0.5, "Price must be a positive numeric value in USD (min: $0.50, max: $50,000.00)")
    .max(50000, "Price must be a positive numeric value in USD (min: $0.50, max: $50,000.00)")
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: "Price must have at most 2 decimal places (e.g., 29.99)",
    }),
  stock: z
    .number({ message: "Stock is required" })
    .int("Stock must be an integer greater than or equal to 0")
    .nonnegative("Stock must be an integer greater than or equal to 0"),
  imageUrl: z
    .string({ message: "Cover art image is required" })
    .refine(
      (val) =>
        val.startsWith("http://") ||
        val.startsWith("https://") ||
        val.startsWith("/api/images/") ||
        val.startsWith("data:image/"),
      {
        message: "Cover art must be a valid HTTP/HTTPS URL, uploaded image path (/api/images/...), or data URI",
      }
    ),
  pages: z.number().int("Page count must be an integer").positive("Page count must be positive").optional(),
  publisher: z.string().trim().optional(),
  publicationYear: z.number().int("Publication year must be an integer").optional(),
  featured: z.boolean().default(false),
  rating: z.number().min(0).max(5).default(5),
  sellerId: z.string().optional(),
  sellerName: z.string().optional(),
  isDelisted: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type IBook = z.infer<typeof BookSchema>;

export const CreateBookSchema = BookSchema.omit({
  _id: true,
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateBookInput = z.infer<typeof CreateBookSchema>;

export const UpdateBookSchema = CreateBookSchema.partial();
export type UpdateBookInput = z.infer<typeof UpdateBookSchema>;
