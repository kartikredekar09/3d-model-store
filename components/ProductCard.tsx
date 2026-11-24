"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { effectivePrice } from "@/lib/products";
import { formatINR } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const price = effectivePrice(product);
  const hasDiscount =
    product.sale_price !== null && product.sale_price < product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - (product.sale_price as number) / product.price) * 100)
    : 0;
  const outOfStock =
    product.fulfilment_type === "ready_stock" && product.stock_quantity <= 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/product/${product.slug}`} className="relative block">
        {/* Plain img (not next/image) so no remote-image config is needed. */}
        <img
          src={product.images[0] ?? "/next.svg"}
          alt={product.title}
          className="aspect-[4/3] w-full object-cover"
          loading="lazy"
        />
        {hasDiscount && (
          <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
            {discountPct}% off
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/product/${product.slug}`}
            className="font-semibold leading-snug text-gray-900 hover:text-brand-700"
          >
            {product.title}
          </Link>
        </div>
        <p className="text-xs uppercase tracking-wide text-gray-500">
          {product.category?.name ?? "3D Print"}
          {product.material ? ` · ${product.material}` : ""}
        </p>
        <p className="text-xs text-gray-500">
          {product.fulfilment_type === "made_to_order"
            ? `Made to order · Dispatches in ${product.dispatch_days} day${product.dispatch_days === 1 ? "" : "s"}`
            : outOfStock
              ? "Out of stock"
              : `In stock · Only ${product.stock_quantity} left`}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div>
            <span className="text-lg font-bold text-gray-900">
              {formatINR(price)}
            </span>
            {hasDiscount && (
              <span className="ml-2 text-sm text-gray-400 line-through">
                {formatINR(product.price)}
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={outOfStock}
            onClick={() =>
              addItem({
                productId: product.id,
                slug: product.slug,
                title: product.title,
                price,
                image: product.images[0] ?? null,
              })
            }
            className="rounded-lg bg-brand-700 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {outOfStock ? "Sold out" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
