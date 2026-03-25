import Link from "next/link";
import { redirect } from "next/navigation";
import { is_admin_authenticated } from "@/lib/admin-auth";
import { login_action } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await is_admin_authenticated()) {
    redirect("/admin");
  }

  const params = await searchParams;

  return (
    <section className="section">
      <div className="container admin-auth-wrap">
        <div className="admin-card admin-auth-card">
          <p className="eyebrow">Admin Access</p>
          <h1 className="section-title">Buying Buddy admin</h1>
          <p className="section-intro">
            Enter the admin password to review orders and send reports.
          </p>
          {params.error ? (
            <p className="admin-inline-alert">Incorrect password. Try again.</p>
          ) : null}
          <form action={login_action} className="admin-form">
            <label className="admin-field">
              <span>Password</span>
              <input
                className="hero-input"
                name="password"
                placeholder="Admin password"
                required
                type="password"
              />
            </label>
            <button className="button button-primary" type="submit">
              Sign in
            </button>
          </form>
          <Link className="admin-back-link" href="/">
            Back to site
          </Link>
        </div>
      </div>
    </section>
  );
}
