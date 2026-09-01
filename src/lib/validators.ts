import { ObjectId } from "mongodb";

export function parseObjectId(id: unknown): ObjectId | null {
  if (typeof id !== "string") {
    return null;
  }

  const trimmed = id.trim();
  if (!/^[0-9a-fA-F]{24}$/.test(trimmed)) {
    return null;
  }

  try {
    return new ObjectId(trimmed);
  } catch {
    return null;
  }
}

export function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export function containsRawCreditCardData(data: unknown): boolean {
  if (!data || typeof data !== "object") {
    return false;
  }

  const SENSITIVE_KEYS = [
    "cardnumber",
    "card_number",
    "pan",
    "cvv",
    "cvc",
    "cvv2",
    "cvc2",
    "securitycode",
    "security_code",
    "ccnumber",
    "cc_number",
  ];

  const stack: unknown[] = [data];

  while (stack.length > 0) {
    const current = stack.pop();

    if (current && typeof current === "object") {
      for (const [key, value] of Object.entries(current as Record<string, unknown>)) {
        const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, "");

        if (SENSITIVE_KEYS.some((s) => normalizedKey.includes(s))) {
          return true;
        }

        if (typeof value === "string") {

          const digitsOnly = value.replace(/[\s-]/g, "");
          if (/^\d{13,19}$/.test(digitsOnly)) {
            return true;
          }
        } else if (typeof value === "number") {
          if (value > 1000000000000 && value < 9999999999999999999) {
            return true;
          }
        } else if (value && typeof value === "object") {
          stack.push(value);
        }
      }
    }
  }

  return false;
}

