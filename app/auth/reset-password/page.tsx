"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getSupabase } from "@/lib/supabase";

/**
 * Reached from the password-reset email link. Supabase parses the
 * recovery token from the URL automatically, so this page only needs to
 * collect the new password.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = async (e: FormEvent) => {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError(null);
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    setBusy(false);
    if (updateError) {
      setError(
        "That reset link may have expired. Please request a new one from the forgot-password page.",
      );
      return;
    }
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900">Set a new password</h1>
      <form onSubmit={reset} className="mt-6 space-y-4">
        <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
          New password (at least 6 characters)
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-brand-600"
            autoComplete="new-password"
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
          {busy ? "Saving…" : "Save new password"}
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
