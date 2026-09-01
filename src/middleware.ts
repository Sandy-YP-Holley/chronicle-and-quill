import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "cq_session";
const DEFAULT_SECRET = "chronicle_and_quill_super_secure_secret_key_32chars_minimum!";

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET || process.env.AUTH_SECRET || DEFAULT_SECRET;
  return new TextEncoder().encode(secret);
}

const PROTECTED_PREFIXES = ["/account", "/checkout", "/order", "/seller", "/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(sessionCookie.value, secretKey, {
      algorithms: ["HS256"],
    });

    if (!payload.userId || !payload.email) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const rawRole = (payload.role as string) || "buyer";
    const role = rawRole === "customer" ? "buyer" : rawRole;

    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      if (role !== "admin") {
        return new NextResponse(
          JSON.stringify({
            type: "https://chronicleandquill.com/errors/forbidden",
            title: "Forbidden",
            status: 403,
            detail: "Curatorial Admin privileges required to access this archival sector.",
            instance: pathname,
          }),
          {
            status: 403,
            headers: {
              "content-type": "application/problem+json",
            },
          }
        );
      }
    }

    if (pathname.startsWith("/seller") && pathname !== "/seller/onboarding") {
      if (role !== "seller" && role !== "admin") {
        const onboardingUrl = new URL("/seller/onboarding", request.url);
        return NextResponse.redirect(onboardingUrl);
      }
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", String(payload.userId));
    requestHeaders.set("x-user-email", String(payload.email));
    requestHeaders.set("x-user-role", role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("Session verification failed:", error);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    "/account/:path*",
    "/checkout/:path*",
    "/order/:path*",
    "/seller/:path*",
    "/admin/:path*",
  ],
};
