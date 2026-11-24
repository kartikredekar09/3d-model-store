"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

/**
 * OAuth callback (Google sign-in). Exchanges the `code` in the URL for a
 * session in the browser, then returns to the shop.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      router.push("/");
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const next = params.get("next");
    if (!code) {
      router.push("/");
      return;
    }
    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error: exchangeError }) => {
        if (exchangeError) {
          setError("Sign-in failed. Please try again.");
          return;
        }
        router.push(next && next.startsWith("/") ? next : "/");
      })
      .catch(() => setError("Sign-in failed. Please try again."));
  }, [router]);

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      {error ? (
        <>
          <h1 className="text-xl font-bold text-gray-900">{error}</h1>
          <a
            href="/auth/login"
            className="mt-4 inline-block font-semibold text-brand-700 hover:underline"
          >
            Back to log in
          </a>
        </>
      ) : (
        <p className="text-gray-600">Signing you in…</p>
      )}
    </div>
  );
}
