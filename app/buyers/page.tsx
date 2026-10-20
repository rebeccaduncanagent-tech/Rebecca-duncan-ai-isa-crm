import { BuyerForm } from "@/components/BuyerForm";
import { brand } from "@/lib/brand";

export default function BuyersPage() {
  return (
    <main className="container">
      <h1>Buy a home in {brand.market}</h1>
      <p className="muted">
        Tell us what you’re looking for in Chicago or the suburbs.
      </p>
      <BuyerForm />
    </main>
  );
}
