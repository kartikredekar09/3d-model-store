"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { loadDemoReturns, type DemoReturn } from "@/lib/demo-orders";
import { formatDate } from "@/lib/format";
import { getSupabase } from "@/lib/supabase";
import type { ReturnRequest, ReturnStatus } from "@/lib/types";

export default function AdminReturnsPage() {
  const { configured } = useAuth();
  const demo = !configured;
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (demo) {
      const demoReturns: DemoReturn[] = loadDemoReturns();
      setRequests(
        demoReturns.map((r) => ({
          id: r.id,
          order_id: r.order_id,
          user_id: null,
          reason: r.reason,
          status: r.status as ReturnStatus,
          created_at: r.created_at,
        })),
      );
      setLoading(false);
      return;
    }
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("return_requests")
      .select("*")
      .order("created_at", { ascending: false });
    setRequests(
      ((data ?? []) as Record<string, unknown>[]).map((r) => ({
        id: String(r.id),
        order_id: String(r.order_id),
        user_id: typeof r.user_id === "string" ? r.user_id : null,
        reason: String(r.reason ?? ""),
        status: String(r.status ?? "requested") as ReturnStatus,
        created_at: String(r.created_at ?? ""),
      })),
    );
    setLoading(false);
  }, [demo]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const setStatus = async (id: string, status: ReturnStatus) => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from("return_requests").update({ status }).eq("id", id);
    void load();
  };

  if (loading) return <p className="text-gray-600">Loading returns…</p>;

  return (
    <div>
      <p className="text-sm text-gray-600">
        Customers can request a return or replacement within 7 days of
        delivery for damaged, defective or wrong items. Approve a request,
        then arrange the pickup or replacement manually.
      </p>
      {requests.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
          No return requests.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {requests.map((r) => (
            <article
              key={r.id}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-sm font-semibold text-gray-900">
                  Order #{r.order_id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(r.created_at)}
                </p>
              </div>
              <p className="mt-2 text-sm text-gray-700">
                Reason: <strong>{r.reason}</strong>
              </p>
              <p className="mt-1 text-sm">
                Status:{" "}
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                  {r.status}
                </span>
              </p>
              {r.status === "requested" && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={demo}
                    onClick={() => void setStatus(r.id, "approved")}
                    className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={demo}
                    onClick={() => void setStatus(r.id, "rejected")}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    Reject
                  </button>
                </div>
              )}
              {r.status === "approved" && (
                <button
                  type="button"
                  disabled={demo}
                  onClick={() => void setStatus(r.id, "completed")}
                  className="mt-3 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  Mark completed
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
