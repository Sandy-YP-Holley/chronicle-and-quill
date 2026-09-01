import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

export function problemResponse(
  status: number,
  title: string,
  detail: string,
  options?: {
    type?: string;
    instance?: string;
    errors?: Record<string, string[]>;
    extensions?: Record<string, unknown>;
  }
): NextResponse<ProblemDetails> {
  const body: ProblemDetails = {
    type: options?.type || `https://chronicleandquill.com/errors/${status}`,
    title,
    status,
    detail,
    ...(options?.instance ? { instance: options.instance } : {}),
    ...(options?.errors ? { errors: options.errors } : {}),
    ...(options?.extensions || {}),
  };

  return NextResponse.json(body, {
    status,
    headers: {
      "Content-Type": "application/problem+json",
    },
  });
}

function formatValidationMessage(path: string, rawMessage: string): string {
  const fieldName = path.split(".").pop() || path;

  if (rawMessage === "Required") {
    return `${fieldName} is required. Please provide a valid ${fieldName}.`;
  }
  if (rawMessage.startsWith("Expected ") && rawMessage.includes(", received ")) {
    return `Invalid type for ${fieldName}: ${rawMessage}.`;
  }
  return rawMessage;
}

export function validationErrorResponse(
  error: ZodError,
  instance?: string
): NextResponse<ProblemDetails> {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".") || "body";
    if (!errors[path]) {
      errors[path] = [];
    }
    const formatted = formatValidationMessage(path, issue.message);
    errors[path].push(formatted);
  }

  const failedFields = Object.keys(errors);
  const detail =
    failedFields.length > 0
      ? `Validation failed on [${failedFields.join(", ")}]. Please correct the highlighted fields.`
      : "Validation failed. Please correct the highlighted fields.";

  return problemResponse(
    422,
    "Unprocessable Entity",
    detail,
    {
      type: "https://chronicleandquill.com/errors/validation-failed",
      instance,
      errors,
    }
  );
}

export function jsonResponse<T>(
  data: T,
  status = 200,
  headers?: HeadersInit
): NextResponse<T> {
  return NextResponse.json(data, { status, headers });
}
