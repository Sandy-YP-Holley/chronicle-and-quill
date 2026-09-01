import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { UserRole } from "@/models/user";

export const SESSION_COOKIE_NAME = "cq_session";
export const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60;

export interface SessionPayload {
  userId: string;
  email: string;
  role?: UserRole;
  name?: string;
  sellerName?: string;
  [key: string]: unknown;
}

const DEFAULT_SECRET = "chronicle_and_quill_super_secure_secret_key_32chars_minimum!";

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET || process.env.AUTH_SECRET || DEFAULT_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret.length < 32 || secret === DEFAULT_SECRET)) {
    throw new Error("SESSION_SECRET or AUTH_SECRET environment variable must be at least 32 characters long in production.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const secretKey = getSecretKey();
  const issuedAt = Math.floor(Date.now() / 1000);
  const expirationTime = issuedAt + SESSION_DURATION_SECONDS;

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(issuedAt)
    .setExpirationTime(expirationTime)
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    if (!payload.userId || !payload.email) {
      return null;
    }

    const rawRole = (payload.role as UserRole) || "buyer";
    const normalizedRole: UserRole = rawRole === "customer" ? "buyer" : rawRole;

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: normalizedRole,
      name: payload.name as string | undefined,
      sellerName: payload.sellerName as string | undefined,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  
  // Ensure cookie is set in all environments, including test
  // In test environment, secure flag should be false to allow cookie in non-HTTPS
  const isProduction = process.env.NODE_ENV === "production";
  const isTest = process.env.NODE_ENV === "test" || process.env.CI === "true";
  
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction, // Only require HTTPS in production, allow in test
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  return verifySessionToken(sessionCookie.value);
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function hasRole(session: SessionPayload | null, allowedRoles: UserRole[]): boolean {
  if (!session?.role) return false;
  const currentRole = session.role === "customer" ? "buyer" : session.role;
  return allowedRoles.includes(currentRole as UserRole) || allowedRoles.includes(session.role);
}
