"use client";

import { useCallback, useEffect, useState } from "react";
import AdminProductForm from "@/components/AdminProductForm";
import { useAuth } from "@/lib/auth-context";
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from "@/lib/demo-products";
import { formatINR } from "@/lib/format";
import { getSupabase } from "@/lib/supabase";
import type { Category, Product } from "@/lib/types";

type Row = Record<string, unknown>;

function asProduct(row: Row, categories: Category[]): Product {
  const categoryId =
    typeof row.category_id === "string" ? row.category_id : null;
  return {
    id: String(row.id ?? ""),
    title: String(row.title ?? ""),
    slug: String(row.slug ?? ""),
    description: String(row.description ?? ""),
    price: Number(row.price ?? 0),
    sale_price: row.sale_price == null ? null : Number(row.sale_price),
    category_id: categoryId,
    category: categories.find((c) => c.id === categoryId) ?? null,
    material: typeof row.material === "string" ? row.material : null,
    formats: Array.isArray(row.formats)
      ? (row.formats as unknown[]).map(String)
      : null,
    preview_glb_url:
      typeof row.preview_glb_url === "string" ? row.preview_glb_url : null,
    images: Array.isArray(row.images)
      ? (row.images as unknown[]).map(String)
      : [],
    weight_grams: row.weight_grams == null ? null : Number(row.weight_grams),
    length_cm: row.length_cm == null ? null : Number(row.length_cm),
    width_cm: row.width_cm == null ? null : Number(row.width_cm),
    height_cm: row.height_cm == null ? null : Number(row.height_cm),
    fulfilment_type:
      row.fulfilment_type === "ready_stock" ? "ready_stock" : "made_to_order",
    stock_quantity: Number(row.stock_quantity ?? 0),
    dispatch_days: Number(row.dispatch_days ?? 3),
    is_published: row.is_published !== false,
    is_featured: row.is_featured === true,
  };
}

export default function AdminProductsPage() {
  const { configured } = useAuth();
  const demo = !configured;
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);
  // editing === undefined → list view; null → new product; Product → edit.

  const load = useCallback(async () => {
    if (demo) {
      setCategories(DEMO_CATEGORIES);
      setProducts(DEMO_PRODUCTS);
      setLoading(false);
      return;
    }
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }
    const [{ data: catData }, { data: prodData }] = await Promise.all([
      supabase.from("categories").select("id, name, slug").order("name"),
      supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);
    const cats = ((catData ?? []) as Row[]).map((r) => ({
      id: String(r.id),
      name: String(r.name),
      slug: String(r.slug),
    }));
    setCategories(cats);
    setProducts(((prodData ?? []) as Row[]).map((r) => asProduct(r, cats)));
    setLoading(false);
  }, [demo]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const remove = async (product: Product) => {
    if (
      !window.confirm(
        `Delete “${product.title}” permanently? This cannot be undone.`,
      )
    ) {
      return;
    }
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from("products").delete().eq("id", product.id);
    void load();
  };

  if (loading) return <p className="text-gray-600">Loading products…</p>;

  if (editing !== undefined) {
    return (
      <AdminProductForm
        product={editing}
        categories={categories}
        onSaved={() => {
          setEditing(undefined);
          void load();
        }}
        onCancel={() => setEditing(undefined)}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          {products.length} product{products.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          disabled={demo}
          title={demo ? "Connect Supabase to add products" : undefined}
          onClick={() => setEditing(null)}
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          + Add product
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Fulfilment</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900">{p.title}</span>
                  <span className="block text-xs text-gray-500">
                    /{p.slug}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {p.category?.name ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {formatINR(p.sale_price ?? p.price)}
                  {p.sale_price !== null && (
                    <span className="ml-1 text-xs text-gray-400 line-through">
                      {formatINR(p.price)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {p.fulfilment_type === "made_to_order"
                    ? `Made to order (${p.dispatch_days}d)`
                    : `Stock: ${p.stock_quantity}`}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      p.is_published
                        ? "bg-brand-100 text-brand-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.is_published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={demo}
                    onClick={() => setEditing(p)}
                    className="mr-3 font-semibold text-brand-700 hover:underline disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={demo}
                    onClick={() => void remove(p)}
                    className="font-semibold text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="p-8 text-center text-gray-500">
            No products yet. Add your first product above.
          </p>
        )}
      </div>
    </div>
  );
}
