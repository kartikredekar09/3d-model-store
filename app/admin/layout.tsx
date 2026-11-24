"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/returns", label: "Returns" },
];

/**
 * Admin area guard. In demo mode (no Supabase) the panel renders with
 * sample data and a banner; with Supabase configured, only signed-in
 * users whose profile role is "admin" get in.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { configured, user, isAdmin, loading } = useAuth();
  const pathname = usePathname();
  const demo = !configured;

  if (!demo && loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-gray-600">
        Loading…
      </div>
    );
  }

  if (!demo && !user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin panel</h1>
        <p className="mt-2 text-gray-600">
          Please log in with an admin account to continue.
        </p>
        <Link
          href="/auth/login?next=/admin"
          className="mt-6 inline-block rounded-lg bg-brand-700 px-5 py-3 font-semibold text-white hover:bg-brand-800"
        >
          Log in
        </Link>
      </div>
    );
  }

  if (!demo && !isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Access denied</h1>
        <p className="mt-2 text-gray-600">
          Your account does not have admin access to this store.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block font-semibold text-brand-700 hover:underline"
        >
          ← Back to the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Admin panel</h1>
      {demo && (
        <p className="mt-2 rounded-lg bg-amber-100 px-4 py-2 text-sm text-amber-900">
          Demo mode — showing sample data. Connect Supabase to manage real
          products and orders.
        </p>
      )}
      <nav className="mt-4 flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              pathname === item.href
                ? "bg-brand-700 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
