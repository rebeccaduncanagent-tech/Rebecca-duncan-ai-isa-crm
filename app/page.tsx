import Link from "next/link";
import { brand } from "@/lib/brand";

export default function HomePage() {
  return (
    <main className="container">
      <section className="hero">
        <h1>Real estate in {brand.market}, made simple</h1>
        <p className="muted">
          {brand.name}, sponsored by {brand.brokerage}. Serving Chicago and the
          surrounding suburbs, from the North Shore to DuPage County.
        </p>
        <div className="cta-row">
          <Link href="/buyers" className="btn">
            I’m Buying
          </Link>
          <Link href="/sellers" className="btn secondary">
            I’m Selling
          </Link>
        </div>
      </section>
    </main>
  );
}
