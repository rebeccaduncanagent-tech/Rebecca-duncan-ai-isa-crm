import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: `${brand.name} | ${brand.market} Real Estate`,
  description: `Buy or sell a home in ${brand.market} with ${brand.name}, sponsored by ${brand.brokerage}.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container">
            <Link href="/" className="brand">
              {brand.name}
            </Link>
            <span className="muted">Sponsored by {brand.brokerage}</span>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
