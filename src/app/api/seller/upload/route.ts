import { NextRequest } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { jsonResponse, problemResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  AllowedImageMimeType,
} from "@/models/image";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return problemResponse(
        401,
        "Unauthorized",
        "Authentication required to upload archival cover images.",
        { instance: request.nextUrl.pathname }
      );
    }

    if (session.role !== "seller" && session.role !== "admin") {
      return problemResponse(
        403,
        "Forbidden",
        "Archival Seller privileges required to upload manuscript covers.",
        { instance: request.nextUrl.pathname }
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return problemResponse(
        400,
        "Bad Request",
        "Malformed multipart form data payload.",
        { instance: request.nextUrl.pathname }
      );
    }

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return problemResponse(
        422,
        "Unprocessable Entity",
        "Validation failed on [file]. Please correct the highlighted fields.",
        {
          type: "https://chronicleandquill.com/errors/validation-failed",
          instance: request.nextUrl.pathname,
          errors: {
            file: ["No image file was provided. Please choose a valid image file to upload."],
          },
        }
      );
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return problemResponse(
        422,
        "Unprocessable Entity",
        "Validation failed on [file]. Please correct the highlighted fields.",
        {
          type: "https://chronicleandquill.com/errors/validation-failed",
          instance: request.nextUrl.pathname,
          errors: {
            file: ["File exceeds maximum allowed size of 10 MB. Please upload a smaller image."],
          },
        }
      );
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as AllowedImageMimeType)) {
      return problemResponse(
        422,
        "Unprocessable Entity",
        "Validation failed on [file]. Please correct the highlighted fields.",
        {
          type: "https://chronicleandquill.com/errors/validation-failed",
          instance: request.nextUrl.pathname,
          errors: {
            file: [
              `Invalid file type (${file.type || "unknown"}). Allowed formats are JPEG, PNG, WebP, and AVIF.`,
            ],
          },
        }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    const imagesCollection = await getCollection("book_images");
    const imageDoc = {
      uploaderId: session.userId,
      fileName: file.name || "cover-image",
      mimeType: file.type,
      size: file.size,
      base64Data,
      createdAt: new Date(),
    };

    const insertResult = await imagesCollection.insertOne(imageDoc);
    const imageId = insertResult.insertedId.toString();
    const imageUrl = `/api/images/${imageId}`;

    return jsonResponse(
      {
        imageUrl,
        imageId,
        fileName: file.name,
        size: file.size,
        mimeType: file.type,
      },
      201
    );
  } catch {
    return problemResponse(
      500,
      "Internal Server Error",
      "An unexpected error occurred while processing manuscript image upload.",
      { instance: request.nextUrl.pathname }
    );
  }
}
