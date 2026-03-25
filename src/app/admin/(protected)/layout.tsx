import Link from "next/link";
import { logout_action } from "@/app/admin/actions";
import { require_admin_page_access } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await require_admin_page_access();

  return (
    <section className="section admin-section">
      <div className="container admin-layout">
        <div className="admin-topbar">
          <div>
            <p className="eyebrow">Buying Buddy Admin</p>
            <h1 className="section-title">Order engine</h1>
          </div>
          <form action={logout_action}>
            <button className="button button-secondary button-small" type="submit">
              Log out
            </button>
          </form>
        </div>
        <nav className="admin-nav" aria-label="Admin">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/orders">Orders</Link>
        </nav>
        {children}
      </div>
    </section>
  );
}
