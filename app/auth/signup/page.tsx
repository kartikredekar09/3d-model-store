"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { getSupabase } from "@/lib/supabase";

export default function SignupPage() {
  const { configured, refreshProfile } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signup = async (e: FormEvent) => {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError(null);
    setBusy(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });
    if (signUpError) {
      setBusy(false);
      setError(signUpError.message);
      return;
    }
    // The database trigger also creates the profile row; this upsert is a
    // backup for projects where the trigger was not applied.
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: email.trim(),
        full_name: fullName.trim(),
        role: "customer",
      });
    }
    setBusy(false);
    if (data.session) {
      await refreshProfile();
      router.push("/");
    } else {
      setNotice(
        "Account created! Please check your email and click the confirmation link, then log in.",
      );
    }
  };

  if (!configured) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
        <p className="mt-4 rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-900">
          Accounts are not available in demo mode. Connect Supabase (see
          README) to enable sign-up.
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
      <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
      <p className="mt-1 text-sm text-gray-600">
        Track orders, save addresses and check out faster.
      </p>
      <form onSubmit={signup} className="mt-6 space-y-4">
        <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
          Full name
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-brand-600"
            autoComplete="name"
          />
        </label>
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
          Password (at least 6 characters)
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
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-brand-700 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
