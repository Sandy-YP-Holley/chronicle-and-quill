import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { problemResponse } from "@/lib/api-response";
import { parseObjectId } from "@/lib/validators";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const objectId = parseObjectId(id);
    if (!objectId) {
      return problemResponse(
        404,
        "Image Not Found",
        `The requested image identifier "${id}" is malformed or invalid.`,
        {
          type: "https://chronicleandquill.com/errors/not-found",
          instance: request.nextUrl.pathname,
        }
      );
    }

    const imagesCollection = await getCollection("book_images");
    const imageDoc = await imagesCollection.findOne({ _id: objectId });

    if (!imageDoc || !imageDoc.base64Data) {
      return problemResponse(
        404,
        "Image Not Found",
        `No archival cover image found with ID "${id}".`,
        {
          type: "https://chronicleandquill.com/errors/not-found",
          instance: request.nextUrl.pathname,
        }
      );
    }

    const buffer = Buffer.from(imageDoc.base64Data, "base64");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": imageDoc.mimeType || "image/jpeg",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return problemResponse(
      500,
      "Internal Server Error",
      "Failed to stream archival image.",
      { instance: request.nextUrl.pathname }
    );
  }
}
