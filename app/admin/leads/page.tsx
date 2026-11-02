import { AdminLeads } from "@/components/AdminLeads";

export const metadata = { title: "Admin | Leads" };

export default function AdminLeadsPage() {
  return (
    <main className="container wide">
      <div className="banner" role="alert">
        Internal use only - add auth before production
      </div>
      <h1>Leads</h1>
      <AdminLeads />
    </main>
  );
}
