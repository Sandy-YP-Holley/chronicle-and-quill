import { NextRequest } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { jsonResponse } from "@/lib/api-response";

export async function POST(_request: NextRequest) {
  await clearSessionCookie();
  return jsonResponse({
    message: "Logged out successfully. Session cleared.",
  });
}

