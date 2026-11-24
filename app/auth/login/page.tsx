"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { getSupabase } from "@/lib/supabase";

function nextPath(): string {
  if (typeof window === "undefined") return "/";
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") ? next : "/";
}

export default function LoginPage() {
  const { configured, refreshProfile } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const login = async (e: FormEvent) => {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    setError(null);
    setBusy(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (signInError) {
      setError("Invalid email or password. Please try again.");
      return;
    }
    await refreshProfile();
    router.push(nextPath());
  };

  const loginWithGoogle = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath())}`,
      },
    });
  };

  if (!configured) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold text-gray-900">Log in</h1>
        <p className="mt-4 rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-900">
          Sign-in is not available in demo mode. Connect Supabase (see README)
          to enable accounts.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block font-semibold text-brand-700 hover:underline"
        >
          ← Continue shopping as a guest
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900">Log in</h1>
      <p className="mt-1 text-sm text-gray-600">
        Welcome back. Log in to track orders and check out faster.
      </p>
      <form onSubmit={login} className="mt-6 space-y-4">
        <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-brand-600"
            autoComplete="email"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-brand-600"
            autoComplete="current-password"
          />
        </label>
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-brand-700 px-5 py-3 font-semibold text-white hover:bg-brand-800 disabled:bg-gray-300"
        >
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
      <button
        type="button"
        onClick={() => void loginWithGoogle()}
        className="mt-3 w-full rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
      >
        Continue with Google
      </button>
      <p className="mt-6 text-center text-sm text-gray-600">
        <Link
          href="/auth/forgot-password"
          className="font-semibold text-brand-700 hover:underline"
        >
          Forgot password?
        </Link>{" "}
        ·{" "}
        <Link
          href="/auth/signup"
          className="font-semibold text-brand-700 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
