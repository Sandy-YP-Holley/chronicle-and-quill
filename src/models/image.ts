import { z } from "zod";
import { ObjectId } from "mongodb";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export const ImageDocumentSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  id: z.string().optional(),
  uploaderId: z.string({ message: "Uploader ID is required" }).min(1, "Uploader ID is required"),
  fileName: z.string({ message: "File name is required" }).min(1, "File name is required"),
  mimeType: z.enum(ALLOWED_IMAGE_MIME_TYPES, {
    message: "Invalid image format. Allowed formats are JPEG, PNG, WebP, and AVIF",
  }),
  size: z
    .number({ message: "File size is required" })
    .int("File size must be an integer")
    .nonnegative("File size cannot be negative")
    .max(
      MAX_IMAGE_SIZE_BYTES,
      "File exceeds maximum allowed size of 10 MB. Please upload a smaller image."
    ),
  base64Data: z.string({ message: "Base64 data is required" }).min(1, "Base64 data is required"),
  createdAt: z.date().default(() => new Date()),
});

export type IImageDocument = z.infer<typeof ImageDocumentSchema>;
