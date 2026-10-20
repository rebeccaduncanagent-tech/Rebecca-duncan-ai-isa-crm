import Link from "next/link";
import { brand } from "@/lib/brand";

export function Success() {
  return (
    <div className="card">
      <h2>Thank you!</h2>
      <p>
        We received your information. A {brand.name} agent will reach out
        shortly.
      </p>
      <Link href="/" className="btn secondary">
        Back to home
      </Link>
    </div>
  );
}
