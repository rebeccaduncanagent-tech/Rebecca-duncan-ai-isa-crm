import { Suspense } from "react";
import { LoginError } from "@/components/LoginError";

export const metadata = { title: "Admin sign in", robots: { index: false } };

export default function AdminLoginPage() {
  return (
    <main className="container">
      <h1>Admin sign in</h1>
      <form className="card form" method="post" action="/api/admin/login">
        <Suspense fallback={null}>
          <LoginError />
        </Suspense>
        <label className="field">
          Password
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            autoFocus
          />
        </label>
        <button className="btn" type="submit">
          Sign in
        </button>
      </form>
    </main>
  );
}
