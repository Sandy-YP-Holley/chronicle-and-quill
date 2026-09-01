import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getCollection } from "@/lib/mongodb";
import { jsonResponse, validationErrorResponse, problemResponse } from "@/lib/api-response";
import { createSessionToken, setSessionCookie, verifyPassword } from "@/lib/auth";
import { LoginUserSchema, UserRole } from "@/models/user";
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

    const parseResult = LoginUserSchema.safeParse(body);
    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error, request.nextUrl.pathname);
    }

    const { email, password } = parseResult.data;
    const usersCollection = await getCollection("users");

    const user = await usersCollection.findOne({ email });
    if (!user || !user.passwordHash) {
      return problemResponse(
        401,
        "Invalid Credentials",
        "The supplied email or password does not match our records.",
        { instance: request.nextUrl.pathname }
      );
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return problemResponse(
        401,
        "Invalid Credentials",
        "The supplied email or password does not match our records.",
        { instance: request.nextUrl.pathname }
      );
    }

    const userId = user._id.toString();

    const rawRole = (user.role as string) || "buyer";
    const userRole = (rawRole === "customer" ? "buyer" : rawRole) as UserRole;

    const token = await createSessionToken({
      userId,
      email: user.email,
      name: user.name,
      role: userRole,
      sellerName: user.sellerName,
    });

    await setSessionCookie(token);

    const cookieStore = await cookies();
    const guestCookie = cookieStore.get(GUEST_COOKIE_NAME);
    if (guestCookie?.value) {
      await mergeGuestCartIntoUserCart(guestCookie.value, userId);
    }

    return jsonResponse({
      message: "Authenticated successfully.",
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        role: userRole,
        sellerName: user.sellerName,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/auth/login:", error);
    return problemResponse(
      500,
      "Internal Server Error",
      "Failed to authenticate user.",
      { instance: request.nextUrl.pathname }
    );
  }
}

