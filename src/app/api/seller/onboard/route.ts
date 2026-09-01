import { NextRequest } from "next/server";
import { getSession, createSessionToken, setSessionCookie } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { parseObjectId } from "@/lib/validators";
import { jsonResponse, validationErrorResponse, problemResponse } from "@/lib/api-response";
import { SellerOnboardingSchema } from "@/models/user";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return problemResponse(
        401,
        "Unauthorized",
        "You must be signed in to register as an archival seller.",
        { instance: request.nextUrl.pathname }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return problemResponse(
        400,
        "Bad Request",
        "Invalid JSON payload supplied.",
        { instance: request.nextUrl.pathname }
      );
    }

    const parseResult = SellerOnboardingSchema.safeParse(body);
    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error, request.nextUrl.pathname);
    }

    const { sellerName, sellerBio, specialtyEra } = parseResult.data;
    const userObjectId = parseObjectId(session.userId);

    if (!userObjectId) {
      return problemResponse(
        400,
        "Invalid Session",
        "Invalid user identifier in session.",
        { instance: request.nextUrl.pathname }
      );
    }

    const usersCollection = await getCollection("users");

    await usersCollection.updateOne(
      { _id: userObjectId },
      {
        $set: {
          role: "seller",
          sellerName,
          sellerBio: sellerBio || "",
          specialtyEra: specialtyEra || "",
          isApprovedSeller: true,
          updatedAt: new Date(),
        },
      }
    );

    const updatedToken = await createSessionToken({
      userId: session.userId,
      email: session.email,
      name: session.name,
      role: "seller",
      sellerName,
    });

    await setSessionCookie(updatedToken);

    return jsonResponse({
      message: "Scholar successfully elevated to Archival Seller.",
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
        role: "seller",
        sellerName,
        sellerBio,
        specialtyEra,
        isApprovedSeller: true,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/seller/onboard:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "Failed to process seller onboarding.",
      { instance: request.nextUrl.pathname }
    );
  }
}
