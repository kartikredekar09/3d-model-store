"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  loadDemoOrders,
  saveDemoReturn,
} from "@/lib/demo-orders";
import { formatDate, formatINR } from "@/lib/format";
import { getSupabase } from "@/lib/supabase";
import { ORDER_STEPS, type Order, type OrderItem, type Shipment } from "@/lib/types";

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
    status: String(row.status ?? "pending") as Order["status"],
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

function OrderTimeline({ status }: { status: Order["status"] }) {
  const idx = ORDER_STEPS.findIndex((s) => s.key === status);
  if (status === "pending") {
    return (
      <p className="text-sm text-amber-700">
        Payment pending — your order will be confirmed once the payment is
        verified.
      </p>
    );
  }
  if (status === "cancelled" || status === "refunded") {
    return (
      <p className="text-sm font-medium text-red-600">
        This order was {status}.
      </p>
    );
  }
  return (
    <ol className="flex flex-wrap gap-1 text-xs">
      {ORDER_STEPS.map((step, i) => (
        <li
          key={step.key}
          className={`rounded-full px-2 py-1 font-semibold ${
            i <= idx ? "bg-brand-700 text-white" : "bg-gray-100 text-gray-500"
          }`}
        >
          {step.label}
        </li>
      ))}
    </ol>
  );
}

function ReturnForm({
  orderId,
  demo,
  onDone,
}: {
  orderId: string;
  demo: boolean;
  onDone: () => void;
}) {
  const { user } = useAuth();
  const [reason, setReason] = useState("Damaged on arrival");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    if (demo) {
      saveDemoReturn({
        id: `RET-${Date.now().toString(36).toUpperCase()}`,
        order_id: orderId,
        reason,
        status: "requested",
        created_at: new Date().toISOString(),
      });
      setMessage("Return request noted (demo mode).");
      setBusy(false);
      onDone();
      return;
    }
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from("return_requests").insert({
      order_id: orderId,
      user_id: user?.id ?? null,
      reason,
      status: "requested",
    });
    setBusy(false);
    if (error) {
      setMessage("Could not submit the request. Please try again.");
    } else {
      setMessage("Return request submitted. We will contact you shortly.");
      onDone();
    }
  };

  return (
    <div className="mt-3 rounded-lg bg-gray-50 p-3">
      <label className="text-xs font-semibold text-gray-600">
        Reason for return
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal"
        >
          <option>Damaged on arrival</option>
          <option>Defective print</option>
          <option>Wrong item delivered</option>
          <option>Changed my mind</option>
        </select>
      </label>
      <button
        type="button"
        disabled={busy}
        onClick={() => void submit()}
        className="mt-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:bg-gray-300"
      >
        {busy ? "Submitting…" : "Submit return request"}
      </button>
      {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
    </div>
  );
}

export default function OrdersPage() {
  const { configured, user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnFor, setReturnFor] = useState<string | null>(null);
  const demo = !configured;

  const load = useCallback(async () => {
    if (!configured) {
      setOrders(loadDemoOrders());
      setLoading(false);
      return;
    }
    const supabase = getSupabase();
    if (!supabase || !user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("orders")
      .select("*, address:addresses(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error || !data) {
      setOrders([]);
      setLoading(false);
      return;
    }
    const rows = data as Row[];
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
  }, [configured, user]);

  useEffect(() => {
    if (!authLoading) queueMicrotask(() => void load());
  }, [authLoading, load]);

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-gray-600">
        Loading your orders…
      </div>
    );
  }

  if (configured && !user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-2 text-gray-600">
          Log in to see your orders and track deliveries.
        </p>
        <Link
          href="/auth/login?next=/orders"
          className="mt-6 inline-block rounded-lg bg-brand-700 px-5 py-3 font-semibold text-white hover:bg-brand-800"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
      {demo && (
        <p className="mt-2 rounded-lg bg-amber-100 px-4 py-2 text-sm text-amber-900">
          Demo mode — showing orders stored in this browser. Log in and connect
          Supabase to see real orders.
        </p>
      )}
      {orders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-600">You haven’t placed any orders yet.</p>
          <Link
            href="/shop"
            className="mt-4 inline-block rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-sm font-semibold text-gray-900">
                  {order.id.length > 12
                    ? `Order #${order.id.slice(0, 8).toUpperCase()}`
                    : `Order #${order.id}`}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(order.created_at)} ·{" "}
                  {order.payment_method === "cod"
                    ? "Cash on Delivery"
                    : `Prepaid (${order.payment_status})`}
                </p>
              </div>
              <div className="mt-3">
                <OrderTimeline status={order.status} />
              </div>
              <ul className="mt-4 space-y-1 text-sm">
                {order.items.map((item, i) => (
                  <li key={item.id ?? `${order.id}-${i}`} className="flex justify-between gap-2">
                    <span className="text-gray-700">
                      {item.title} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-right text-sm">
                Shipping: {formatINR(order.shipping_charge)} ·{" "}
                <strong>Total: {formatINR(order.total)}</strong>
              </p>
              {order.shipment?.tracking_url && (
                <p className="mt-2 text-sm">
                  Tracking:{" "}
                  <a
                    href={order.shipment.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand-700 underline"
                  >
                    {order.shipment.courier_name ?? "Courier"} —{" "}
                    {order.shipment.tracking_number ?? "track package"}
                  </a>
                </p>
              )}
              {order.address && (
                <p className="mt-2 text-sm text-gray-600">
                  Deliver to: {order.address.full_name},{" "}
                  {order.address.address_line}, {order.address.city},{" "}
                  {order.address.state} — {order.address.pincode}
                </p>
              )}
              {order.status === "delivered" && (
                <div className="mt-3">
                  {returnFor === order.id ? (
                    <ReturnForm
                      orderId={order.id}
                      demo={demo}
                      onDone={() => setReturnFor(null)}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setReturnFor(order.id)}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Request return / replacement
                    </button>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
