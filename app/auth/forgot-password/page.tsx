"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { getSupabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const { configured } = useAuth();
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setBusy(false);
    // Always show the same message, whether or not the email exists.
    setNotice(
      "If an account exists for that email, a password reset link has been sent. The link expires soon, so please use it promptly.",
    );
  };

  if (!configured) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold text-gray-900">Forgot password</h1>
        <p className="mt-4 rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-900">
          Password reset is not available in demo mode. Connect Supabase (see
          README) to enable accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900">Forgot password</h1>
      <p className="mt-1 text-sm text-gray-600">
        Enter your email and we&rsquo;ll send you a reset link.
      </p>
      <form onSubmit={send} className="mt-6 space-y-4">
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
        {notice && (
          <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm font-medium text-brand-900">
            {notice}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-brand-700 px-5 py-3 font-semibold text-white hover:bg-brand-800 disabled:bg-gray-300"
        >
          {busy ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        <Link
          href="/auth/login"
          className="font-semibold text-brand-700 hover:underline"
        >
          Back to log in
        </Link>
      </p>
    </div>
  );
}
