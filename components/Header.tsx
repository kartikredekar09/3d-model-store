"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart";

export default function Header() {
  const { count } = useCart();
  const { user, isAdmin, signOut, loading } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-lg font-bold text-white">
            3D
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold text-gray-900">
              3D Model Store
            </span>
            <span className="block text-[11px] uppercase tracking-wide text-brand-700">
              Custom 3D-printed products
            </span>
          </span>
        </Link>

        <form
          onSubmit={onSearch}
          className="order-3 flex w-full min-w-0 flex-1 items-center gap-2 sm:order-none sm:w-auto"
        >
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search figurines, decor, prototypes…"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            aria-label="Search products"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
          >
            Search
          </button>
        </form>

        <nav className="ml-auto flex items-center gap-1 text-sm sm:gap-2">
          <Link
            href="/shop"
            className="hidden rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 md:block"
          >
            Shop
          </Link>
          <Link
            href="/orders"
            className="hidden rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 md:block"
          >
            My Orders
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden rounded-lg bg-brand-100 px-3 py-2 font-semibold text-brand-800 hover:bg-brand-200 md:block"
            >
              Admin
            </Link>
          )}
          <Link
            href="/cart"
            className="relative rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100"
            aria-label={`Cart, ${count} items`}
          >
            Cart
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          {!loading &&
            (user ? (
              <button
                type="button"
                onClick={() => {
                  void signOut();
                  router.push("/");
                }}
                className="rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100"
              >
                Log out
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="rounded-lg bg-gray-900 px-3 py-2 font-semibold text-white hover:bg-gray-800"
              >
                Log in
              </Link>
            ))}
          <button
            type="button"
            className="rounded-lg px-2 py-2 text-gray-700 hover:bg-gray-100 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </nav>
      </div>

      {menuOpen && (
        <nav className="border-t border-gray-200 px-4 py-2 text-sm md:hidden">
          <Link href="/shop" className="block py-2 font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
            Shop
          </Link>
          <Link href="/orders" className="block py-2 font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
            My Orders
          </Link>
          {isAdmin && (
            <Link href="/admin" className="block py-2 font-semibold text-brand-800" onClick={() => setMenuOpen(false)}>
              Admin
            </Link>
          )}
          <Link href="/about" className="block py-2 font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
            About
          </Link>
          <Link href="/faq" className="block py-2 font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
            FAQ
          </Link>
          <Link href="/contact" className="block py-2 font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
            Contact
          </Link>
        </nav>
      )}
    </header>
  );
}
