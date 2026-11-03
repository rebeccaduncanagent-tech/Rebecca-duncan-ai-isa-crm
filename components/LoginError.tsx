"use client";

import { useSearchParams } from "next/navigation";

export function LoginError() {
  const params = useSearchParams();
  if (!params.get("error")) return null;
  return (
    <p className="notice" role="alert">
      That password didn&apos;t work. Please try again.
    </p>
  );
}
