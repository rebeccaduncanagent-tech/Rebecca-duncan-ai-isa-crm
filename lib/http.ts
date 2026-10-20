import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { EnvError } from "./env";

export function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }
  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  console.error("[api] unexpected error:", error);
  const message = error instanceof EnvError ? error.message : "Internal error";
  return NextResponse.json({ error: message }, { status: 500 });
}
