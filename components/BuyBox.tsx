"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/format";
import { effectivePrice } from "@/lib/products";
import type { Product } from "@/lib/types";

/** Quantity selector + Add to cart / Buy now on the product page. */
export default function BuyBox({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const price = effectivePrice(product);
  const outOfStock =
    product.fulfilment_type === "ready_stock" && product.stock_quantity <= 0;

  const item = {
    productId: product.id,
    slug: product.slug,
    title: product.title,
    price,
    image: product.images[0] ?? null,
  };

  const handleAdd = () => {
    addItem(item, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="mt-5">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700" htmlFor="qty">
          Qty
        </label>
        <div className="flex items-center rounded-lg border border-gray-300">
          <button
            type="button"
            aria-label="Decrease quantity"
            className="px-3 py-2 text-lg"
            onClick={() => setQty((v) => Math.max(1, v - 1))}
          >
            −
          </button>
          <input
            id="qty"
            type="number"
            min={1}
            max={99}
            value={qty}
            onChange={(e) =>
              setQty(Math.max(1, Math.min(99, Number(e.target.value) || 1)))
            }
            className="w-12 border-x border-gray-300 py-2 text-center text-sm outline-none"
          />
          <button
            type="button"
            aria-label="Increase quantity"
            className="px-3 py-2 text-lg"
            onClick={() => setQty((v) => Math.min(99, v + 1))}
          >
            +
          </button>
        </div>
        <span className="text-sm text-gray-600">
          Total: <strong>{formatINR(price * qty)}</strong>
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={outOfStock}
          onClick={handleAdd}
          className="flex-1 rounded-lg border-2 border-brand-700 px-5 py-3 font-semibold text-brand-800 hover:bg-brand-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
        >
          {added ? "Added ✓" : "Add to cart"}
        </button>
        <button
          type="button"
          disabled={outOfStock}
          onClick={() => {
            addItem(item, qty);
            router.push("/checkout");
          }}
          className="flex-1 rounded-lg bg-brand-700 px-5 py-3 font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          Buy now
        </button>
      </div>
      {outOfStock && (
        <p className="mt-3 text-sm text-red-600">
          This item is currently out of stock.
        </p>
      )}
    </div>
  );
}
