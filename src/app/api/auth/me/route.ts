import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { parseObjectId } from "@/lib/validators";
import { jsonResponse, problemResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session?.userId) {
    return problemResponse(
      401,
      "Unauthorized",
      "No active authenticated session found.",
      {
        type: "https://chronicleandquill.com/errors/unauthorized",
        instance: request.nextUrl.pathname,
      }
    );
  }

  const usersCollection = await getCollection("users");
  const userObjectId = parseObjectId(session.userId);
  const dbUser = userObjectId ? await usersCollection.findOne({ _id: userObjectId }) : null;

  const rawRole = dbUser?.role || session.role || "buyer";
  const normalizedRole = rawRole === "customer" ? "buyer" : rawRole;

  return jsonResponse({
    user: {
      id: session.userId,
      email: dbUser?.email || session.email,
      name: dbUser?.name || session.name,
      role: normalizedRole,
      sellerName: dbUser?.sellerName || session.sellerName,
      sellerBio: dbUser?.sellerBio,
      specialtyEra: dbUser?.specialtyEra,
      isApprovedSeller: dbUser?.isApprovedSeller ?? false,
    },
  });
}
