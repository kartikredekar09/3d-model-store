"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart";
import { saveDemoOrder } from "@/lib/demo-orders";
import { formatINR } from "@/lib/format";
import { isRazorpayLoaded, type RazorpayOptions } from "@/lib/razorpay";
import { shippingCharge } from "@/lib/shipping";
import type { Order, PaymentMethod } from "@/lib/types";

interface CreateOrderResponse {
  ok?: boolean;
  error?: string;
  demo?: boolean;
  orderId?: string;
  razorpayOrderId?: string;
  keyId?: string;
  amount?: number;
  currency?: string;
  total?: number;
}

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json() as Promise<{ razorpayConfigured?: boolean }>)
      .then((cfg) => {
        const enabled = cfg.razorpayConfigured === true;
        setRazorpayEnabled(enabled);
        if (enabled) setPaymentMethod("prepaid");
      })
      .catch(() => undefined);
  }, []);

  const shipping = shippingCharge(subtotal);
  const total = subtotal + shipping;

  const placeOrder = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (
      !fullName.trim() ||
      !/^\d{10}$/.test(phone.replace(/\s/g, "")) ||
      !addressLine.trim() ||
      !city.trim() ||
      !state.trim() ||
      !/^\d{6}$/.test(pincode)
    ) {
      setError(
        "Please fill in a complete delivery address (10-digit phone, 6-digit pincode).",
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
          address: {
            full_name: fullName.trim(),
            phone: phone.replace(/\s/g, ""),
            address_line: addressLine.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode,
          },
          paymentMethod,
          userId: user?.id ?? null,
        }),
      });
      const data = (await res.json()) as CreateOrderResponse;
      if (!res.ok || !data.ok || !data.orderId) {
        setError(data.error ?? "Could not place the order. Please try again.");
        setSubmitting(false);
        return;
      }

      if (paymentMethod === "cod") {
        if (data.demo) {
          // Demo mode: keep the order in the browser so My Orders works.
          const demoOrder: Order = {
            id: data.orderId,
            user_id: null,
            address: {
              full_name: fullName.trim(),
              phone: phone.replace(/\s/g, ""),
              address_line: addressLine.trim(),
              city: city.trim(),
              state: state.trim(),
              pincode,
            },
            items: items.map((i) => ({
              product_id: i.productId,
              title: i.title,
              price: i.price,
              quantity: i.qty,
              image: i.image,
            })),
            subtotal,
            shipping_charge: shipping,
            total,
            status: "confirmed",
            payment_status: "pending",
            payment_method: "cod",
            razorpay_order_id: null,
            razorpay_payment_id: null,
            shipment: null,
            created_at: new Date().toISOString(),
          };
          saveDemoOrder(demoOrder);
        }
        clear();
        router.push(`/order-success?order=${data.orderId}&method=cod`);
        return;
      }

      // Prepaid: open Razorpay Checkout. The order is only marked paid
      // when the webhook verifies the payment (see api/webhooks/razorpay).
      if (
        !data.razorpayOrderId ||
        !data.keyId ||
        !data.amount ||
        !isRazorpayLoaded() ||
        !window.Razorpay
      ) {
        setError(
          "Online payment could not start. Please try Cash on Delivery instead.",
        );
        setSubmitting(false);
        return;
      }
      const options: RazorpayOptions = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency ?? "INR",
        name: "3D Model Store",
        description: `Order ${data.orderId.slice(0, 8)}`,
        order_id: data.razorpayOrderId,
        prefill: { name: fullName.trim(), contact: phone.replace(/\s/g, "") },
        theme: { color: "#15803d" },
        handler: () => {
          clear();
          router.push(
            `/order-success?order=${data.orderId as string}&method=prepaid`,
          );
        },
        modal: {
          ondismiss: () => {
            setError(
              "Payment was cancelled. Your order is saved as pending — if money was deducted, it will be refunded automatically.",
            );
            setSubmitting(false);
          },
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="mt-2 text-gray-600">
          Add a product before checking out.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-lg bg-brand-700 px-5 py-3 font-semibold text-white hover:bg-brand-800"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>

      <form
        onSubmit={placeOrder}
        className="mt-6 grid gap-8 lg:grid-cols-3"
      >
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="font-bold text-gray-900">Delivery address</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                Phone (10 digits)
                <input
                  required
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-brand-600"
                  autoComplete="tel"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600 sm:col-span-2">
                Address (house no., street, area)
                <textarea
                  required
                  rows={2}
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-brand-600"
                  autoComplete="street-address"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
                City
                <input
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-brand-600"
                  autoComplete="address-level2"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
                State
                <input
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-brand-600"
                  autoComplete="address-level1"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
                Pincode (6 digits)
                <input
                  required
                  inputMode="numeric"
                  value={pincode}
                  onChange={(e) =>
                    setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-brand-600"
                  autoComplete="postal-code"
                />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="font-bold text-gray-900">Payment method</h2>
            <div className="mt-3 space-y-3">
              <label
                className={`flex items-start gap-3 rounded-lg border p-4 ${
                  !razorpayEnabled
                    ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
                    : "cursor-pointer border-gray-300 hover:border-brand-600"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="prepaid"
                  disabled={!razorpayEnabled}
                  checked={paymentMethod === "prepaid"}
                  onChange={() => setPaymentMethod("prepaid")}
                  className="mt-1"
                />
                <span>
                  <span className="block font-semibold text-gray-900">
                    Pay now — UPI, card or netbanking
                  </span>
                  <span className="block text-sm text-gray-600">
                    {razorpayEnabled
                      ? "Secure payment via Razorpay."
                      : "Online payment is not set up yet — please choose Cash on Delivery."}
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-300 p-4 hover:border-brand-600">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mt-1"
                />
                <span>
                  <span className="block font-semibold text-gray-900">
                    Cash on Delivery (COD)
                  </span>
                  <span className="block text-sm text-gray-600">
                    Pay in cash when your order arrives. We may call to confirm
                    COD orders before printing.
                  </span>
                </span>
              </label>
            </div>
          </section>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
        </div>

        <aside className="h-fit rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-bold text-gray-900">Order summary</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-2">
                <span className="text-gray-700">
                  {i.title} × {i.qty}
                </span>
                <span className="font-medium">{formatINR(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-gray-200 pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Subtotal</dt>
              <dd className="font-medium">{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Shipping</dt>
              <dd className="font-medium">
                {shipping === 0 ? "FREE" : formatINR(shipping)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold">
              <dt>Total</dt>
              <dd>{formatINR(total)}</dd>
            </div>
          </dl>
          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full rounded-lg bg-brand-700 px-5 py-3 font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {submitting
              ? "Placing your order…"
              : paymentMethod === "cod"
                ? `Place order · ${formatINR(total)} (COD)`
                : `Pay ${formatINR(total)}`}
          </button>
          <p className="mt-3 text-center text-xs text-gray-500">
            By placing this order you agree to our Terms and Refund Policy.
          </p>
        </aside>
      </form>
    </div>
  );
}
