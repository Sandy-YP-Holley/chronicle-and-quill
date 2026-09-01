import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getCollection } from "@/lib/mongodb";
import { jsonResponse, validationErrorResponse, problemResponse } from "@/lib/api-response";
import { createSessionToken, setSessionCookie, hashPassword } from "@/lib/auth";
import { CreateUserSchema } from "@/models/user";
import { GUEST_COOKIE_NAME, mergeGuestCartIntoUserCart } from "@/lib/cart-helpers";

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return problemResponse(
        400,
        "Bad Request",
        "Invalid JSON payload supplied in request body.",
        { instance: request.nextUrl.pathname }
      );
    }

    const parseResult = CreateUserSchema.safeParse(body);
    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error, request.nextUrl.pathname);
    }

    const { email, password, name } = parseResult.data;
    const usersCollection = await getCollection("users");

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return problemResponse(
        409,
        "Email Already Registered",
        "An account with this email address already exists in the archival records.",
        { instance: request.nextUrl.pathname }
      );
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
      email,
      name: name || "Scholar",
      role: "buyer" as const,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await usersCollection.insertOne(newUser);
    const userId = insertResult.insertedId.toString();

    const token = await createSessionToken({
      userId,
      email,
      name: newUser.name,
      role: newUser.role,
    });

    await setSessionCookie(token);

    const cookieStore = await cookies();
    const guestCookie = cookieStore.get(GUEST_COOKIE_NAME);
    if (guestCookie?.value) {
      await mergeGuestCartIntoUserCart(guestCookie.value, userId);
    }

    return jsonResponse(
      {
        message: "Archival scholar account registered successfully.",
        user: {
          id: userId,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      },
      201
    );
  } catch (error) {
    console.error("Error in POST /api/auth/register:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "Failed to register account.",
      { instance: request.nextUrl.pathname }
    );
  }
}

