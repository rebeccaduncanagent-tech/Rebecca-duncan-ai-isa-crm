import { SellerForm } from "@/components/SellerForm";
import { brand } from "@/lib/brand";

export default function SellersPage() {
  return (
    <main className="container">
      <h1>Sell your {brand.market} home</h1>
      <p className="muted">
        Share a few details and we’ll prepare a no-obligation consultation.
      </p>
      <SellerForm />
    </main>
  );
}
