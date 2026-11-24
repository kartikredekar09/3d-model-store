"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { loadDemoOrders } from "@/lib/demo-orders";
import { DEMO_PRODUCTS } from "@/lib/demo-products";
import { formatDate, formatINR } from "@/lib/format";
import { getSupabase } from "@/lib/supabase";

interface Stats {
  revenue: number;
  orderCount: number;
  productCount: number;
  pendingReturns: number;
  recentOrders: { id: string; total: number; status: string; created_at: string }[];
  topProducts: { title: string; qty: number }[];
}

const EMPTY: Stats = {
  revenue: 0,
  orderCount: 0,
  productCount: 0,
  pendingReturns: 0,
  recentOrders: [],
  topProducts: [],
};

export default function AdminDashboardPage() {
  const { configured } = useAuth();
  const [stats, setStats] = useState<Stats>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!configured) {
        const demoOrders = loadDemoOrders();
        const revenue = demoOrders.reduce((s, o) => s + o.total, 0);
        const qtyByTitle = new Map<string, number>();
        for (const o of demoOrders) {
          for (const item of o.items) {
            qtyByTitle.set(
              item.title,
              (qtyByTitle.get(item.title) ?? 0) + item.quantity,
            );
          }
        }
        setStats({
          revenue,
          orderCount: demoOrders.length,
          productCount: DEMO_PRODUCTS.length,
          pendingReturns: 0,
          recentOrders: demoOrders.slice(0, 5).map((o) => ({
            id: o.id,
            total: o.total,
            status: o.status,
            created_at: o.created_at,
          })),
          topProducts: [...qtyByTitle.entries()]
            .map(([title, qty]) => ({ title, qty }))
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5),
        });
        setLoading(false);
        return;
      }
      const supabase = getSupabase();
      if (!supabase) {
        setLoading(false);
        return;
      }
      const [
        { data: orders },
        { data: products },
        { data: returns },
        { data: items },
      ] = await Promise.all([
        supabase
          .from("orders")
          .select("id, total, status, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("products").select("id", { count: "exact" }),
        supabase
          .from("return_requests")
          .select("id", { count: "exact" })
          .eq("status", "requested"),
        supabase.from("order_items").select("title, quantity"),
      ]);
      const orderRows = (orders ?? []) as {
        id: string;
        total: number;
        status: string;
        created_at: string;
      }[];
      const revenue = orderRows
        .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
        .reduce((s, o) => s + Number(o.total ?? 0), 0);
      const qtyByTitle = new Map<string, number>();
      for (const row of (items ?? []) as { title: string; quantity: number }[]) {
        qtyByTitle.set(
          row.title,
          (qtyByTitle.get(row.title) ?? 0) + Number(row.quantity ?? 0),
        );
      }
      setStats({
        revenue,
        orderCount: orderRows.length,
        productCount: products?.length ?? 0,
        pendingReturns: returns?.length ?? 0,
        recentOrders: orderRows.slice(0, 5),
        topProducts: [...qtyByTitle.entries()]
          .map(([title, qty]) => ({ title, qty }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 5),
      });
      setLoading(false);
    };
    void load();
  }, [configured]);

  if (loading) {
    return <p className="text-gray-600">Loading dashboard…</p>;
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total revenue", value: formatINR(stats.revenue) },
          { label: "Orders", value: String(stats.orderCount) },
          { label: "Products", value: String(stats.productCount) },
          { label: "Pending returns", value: String(stats.pendingReturns) },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-bold text-gray-900">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm font-semibold text-brand-700 hover:underline"
            >
              View all →
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No orders yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {stats.recentOrders.map((o) => (
                <li key={o.id} className="flex justify-between gap-2">
                  <span className="font-mono text-gray-700">
                    #{o.id.slice(0, 8).toUpperCase()} · {formatDate(o.created_at)}
                  </span>
                  <span>
                    <span className="mr-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                      {o.status}
                    </span>
                    <strong>{formatINR(o.total)}</strong>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-bold text-gray-900">Top products</h2>
            <Link
              href="/admin/products"
              className="text-sm font-semibold text-brand-700 hover:underline"
            >
              Manage →
            </Link>
          </div>
          {stats.topProducts.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">
              No sales yet — top products will appear here.
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {stats.topProducts.map((p) => (
                <li key={p.title} className="flex justify-between gap-2">
                  <span className="text-gray-700">{p.title}</span>
                  <strong>{p.qty} sold</strong>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
