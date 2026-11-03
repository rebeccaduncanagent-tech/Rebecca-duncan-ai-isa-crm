import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminLeads } from "@/components/AdminLeads";
import { SESSION_COOKIE, isValidSessionToken } from "@/lib/auth";

export const metadata = { title: "Admin | Leads", robots: { index: false } };

async function AdminGate() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!isValidSessionToken(token)) redirect("/admin/login");
  return <AdminLeads />;
}

export default function AdminLeadsPage() {
  return (
    <main className="container wide">
      <div className="cta-row" style={{ justifyContent: "space-between" }}>
        <h1>Leads</h1>
        <form method="post" action="/api/admin/logout">
          <button className="btn secondary" type="submit">
            Sign out
          </button>
        </form>
      </div>
      <Suspense fallback={<p className="muted">Loading…</p>}>
        <AdminGate />
      </Suspense>
    </main>
  );
}
