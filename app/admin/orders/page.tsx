"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { loadDemoOrders } from "@/lib/demo-orders";
import { formatDate, formatINR } from "@/lib/format";
import { getSupabase } from "@/lib/supabase";
import {
  ADMIN_ORDER_STATUSES,
  type Order,
  type OrderItem,
  type OrderStatus,
  type Shipment,
} from "@/lib/types";

type Row = Record<string, unknown>;

function asOrder(row: Row, items: OrderItem[], shipment: Shipment | null): Order {
  const addr = row.address as Row | null;
  return {
    id: String(row.id),
    user_id: typeof row.user_id === "string" ? row.user_id : null,
    address: addr
      ? {
          full_name: String(addr.full_name ?? ""),
          phone: String(addr.phone ?? ""),
          address_line: String(addr.address_line ?? ""),
          city: String(addr.city ?? ""),
          state: String(addr.state ?? ""),
          pincode: String(addr.pincode ?? ""),
        }
      : null,
    items,
    subtotal: Number(row.subtotal ?? 0),
    shipping_charge: Number(row.shipping_charge ?? 0),
    total: Number(row.total ?? 0),
    status: String(row.status ?? "pending") as OrderStatus,
    payment_status: String(row.payment_status ?? "pending") as Order["payment_status"],
    payment_method: row.payment_method === "cod" ? "cod" : "prepaid",
    razorpay_order_id:
      typeof row.razorpay_order_id === "string" ? row.razorpay_order_id : null,
    razorpay_payment_id:
      typeof row.razorpay_payment_id === "string"
        ? row.razorpay_payment_id
        : null,
    shipment,
    created_at: String(row.created_at ?? ""),
  };
}

function OrderEditor({
  order,
  demo,
  onSaved,
}: {
  order: Order;
  demo: boolean;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [courier, setCourier] = useState(
    order.shipment?.courier_name ?? "",
  );
  const [trackingNumber, setTrackingNumber] = useState(
    order.shipment?.tracking_number ?? "",
  );
  const [trackingUrl, setTrackingUrl] = useState(
    order.shipment?.tracking_url ?? "",
  );
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    const { error: orderError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", order.id);
    let shipmentError = null;
    if (!orderError && (courier.trim() || trackingNumber.trim() || trackingUrl.trim())) {
      const { error } = await supabase.from("shipments").upsert(
        {
          order_id: order.id,
          courier_name: courier.trim() || null,
          tracking_number: trackingNumber.trim() || null,
          tracking_url: trackingUrl.trim() || null,
          status,
          shipped_at:
            status === "shipped" || status === "out_for_delivery" || status === "delivered"
              ? new Date().toISOString()
              : null,
          delivered_at:
            status === "delivered" ? new Date().toISOString() : null,
        },
        { onConflict: "order_id" },
      );
      shipmentError = error;
    }
    setBusy(false);
    if (!orderError && !shipmentError) {
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
      onSaved();
    }
  };

  return (
    <div className="mt-4 grid gap-3 rounded-lg bg-gray-50 p-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
        Order status
        <select
          value={status}
          disabled={demo}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal"
        >
          {ADMIN_ORDER_STATUSES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
        Courier (e.g. Delhivery, DTDC)
        <input
          value={courier}
          disabled={demo}
          onChange={(e) => setCourier(e.target.value)}
          placeholder="Booked manually in Shiprocket"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
        Tracking number
        <input
          value={trackingNumber}
          disabled={demo}
          onChange={(e) => setTrackingNumber(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
        Tracking URL
        <input
          value={trackingUrl}
          disabled={demo}
          onChange={(e) => setTrackingUrl(e.target.value)}
          placeholder="https://…"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal"
        />
      </label>
      <div className="sm:col-span-2">
        <button
          type="button"
          disabled={demo || busy}
          onClick={() => void save()}
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {busy ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
        {demo && (
          <span className="ml-3 text-xs text-gray-500">
            Connect Supabase to update orders.
          </span>
        )}
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const { configured } = useAuth();
  const demo = !configured;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (demo) {
      setOrders(loadDemoOrders());
      setLoading(false);
      return;
    }
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("orders")
      .select("*, address:addresses(*)")
      .order("created_at", { ascending: false });
    const rows = (data ?? []) as Row[];
    const orderIds = rows.map((r) => String(r.id));
    const [{ data: itemsData }, { data: shipmentsData }] = await Promise.all([
      supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds.length ? orderIds : ["none"]),
      supabase
        .from("shipments")
        .select("*")
        .in("order_id", orderIds.length ? orderIds : ["none"]),
    ]);
    const itemsByOrder = new Map<string, OrderItem[]>();
    for (const row of (itemsData ?? []) as Row[]) {
      const oid = String(row.order_id);
      const list = itemsByOrder.get(oid) ?? [];
      list.push({
        id: String(row.id),
        product_id: String(row.product_id),
        title: String(row.title ?? ""),
        price: Number(row.price ?? 0),
        quantity: Number(row.quantity ?? 1),
      });
      itemsByOrder.set(oid, list);
    }
    const shipmentByOrder = new Map<string, Shipment>();
    for (const row of (shipmentsData ?? []) as Row[]) {
      shipmentByOrder.set(String(row.order_id), {
        id: String(row.id),
        order_id: String(row.order_id),
        courier_name:
          typeof row.courier_name === "string" ? row.courier_name : null,
        tracking_number:
          typeof row.tracking_number === "string" ? row.tracking_number : null,
        tracking_url:
          typeof row.tracking_url === "string" ? row.tracking_url : null,
        status: typeof row.status === "string" ? row.status : null,
        shipped_at:
          typeof row.shipped_at === "string" ? row.shipped_at : null,
        delivered_at:
          typeof row.delivered_at === "string" ? row.delivered_at : null,
      });
    }
    setOrders(
      rows.map((r) =>
        asOrder(
          r,
          itemsByOrder.get(String(r.id)) ?? [],
          shipmentByOrder.get(String(r.id)) ?? null,
        ),
      ),
    );
    setLoading(false);
  }, [demo]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  if (loading) return <p className="text-gray-600">Loading orders…</p>;

  return (
    <div>
      <p className="text-sm text-gray-600">
        {orders.length} order{orders.length === 1 ? "" : "s"} · Book shipments
        in Shiprocket, then paste the courier and tracking details here so
        customers can track their delivery.
      </p>
      {orders.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
          No orders yet.
        </p>
      ) : (
        <div className="mt-4 space-y-5">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-sm font-semibold text-gray-900">
                  #{order.id.slice(0, 8).toUpperCase()} ·{" "}
                  {formatDate(order.created_at)}
                </p>
                <p className="text-sm text-gray-600">
                  {order.payment_method === "cod"
                    ? "Cash on Delivery"
                    : `Prepaid (${order.payment_status})`}{" "}
                  · <strong>{formatINR(order.total)}</strong>
                </p>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-gray-700">
                {order.items.map((item, i) => (
                  <li key={item.id ?? `${order.id}-${i}`}>
                    {item.title} × {item.quantity} —{" "}
                    {formatINR(item.price * item.quantity)}
                  </li>
                ))}
              </ul>
              {order.address && (
                <p className="mt-2 text-sm text-gray-600">
                  {order.address.full_name} · {order.address.phone} ·{" "}
                  {order.address.address_line}, {order.address.city},{" "}
                  {order.address.state} — {order.address.pincode}
                </p>
              )}
              <OrderEditor order={order} demo={demo} onSaved={load} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
