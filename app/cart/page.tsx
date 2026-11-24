"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, shippingCharge } from "@/lib/shipping";

export default function CartPage() {
  const { items, subtotal, setQty, removeItem, clear } = useCart();
  const shipping = shippingCharge(subtotal);
  const total = subtotal + shipping;
  const awayFromFree = FREE_SHIPPING_THRESHOLD - subtotal;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="mt-2 text-gray-600">
          Browse the shop and add something you like.
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
      <h1 className="text-2xl font-bold text-gray-900">Your cart</h1>

      {awayFromFree > 0 ? (
        <p className="mt-3 rounded-lg bg-brand-50 px-4 py-2 text-sm text-brand-900">
          Add {formatINR(awayFromFree)} more to get free shipping.
        </p>
      ) : (
        <p className="mt-3 rounded-lg bg-brand-50 px-4 py-2 text-sm text-brand-900">
          You’ve unlocked free shipping.
        </p>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4"
            >
              <Link href={`/product/${item.slug}`} className="shrink-0">
                <img
                  src={item.image ?? "/next.svg"}
                  alt={item.title}
                  className="h-20 w-24 rounded-lg object-cover"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/product/${item.slug}`}
                  className="font-semibold text-gray-900 hover:text-brand-700"
                >
                  {item.title}
                </Link>
                <p className="mt-1 text-sm text-gray-600">
                  {formatINR(item.price)} each
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="flex items-center rounded-lg border border-gray-300">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      className="px-3 py-1"
                      onClick={() => setQty(item.productId, item.qty - 1)}
                    >
                      −
                    </button>
                    <span className="w-8 border-x border-gray-300 py-1 text-center text-sm">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      className="px-3 py-1"
                      onClick={() => setQty(item.productId, item.qty + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <p className="font-bold text-gray-900">
                {formatINR(item.price * item.qty)}
              </p>
            </div>
          ))}
          <button
            type="button"
            onClick={clear}
            className="text-sm font-medium text-gray-500 hover:underline"
          >
            Clear cart
          </button>
        </div>

        <div className="h-fit rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-bold text-gray-900">Order summary</h2>
          <dl className="mt-3 space-y-2 text-sm">
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
          <Link
            href="/checkout"
            className="mt-5 block rounded-lg bg-brand-700 px-5 py-3 text-center font-semibold text-white hover:bg-brand-800"
          >
            Proceed to checkout
          </Link>
          <p className="mt-3 text-center text-xs text-gray-500">
            Secure checkout · UPI, cards, netbanking or Cash on Delivery
          </p>
        </div>
      </div>
    </div>
  );
}
