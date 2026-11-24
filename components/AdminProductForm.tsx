"use client";

import { useState, type FormEvent } from "react";
import { getSupabase } from "@/lib/supabase";
import type { Category, FulfilmentType, Product } from "@/lib/types";

export interface ProductFormValues {
  title: string;
  slug: string;
  description: string;
  price: string;
  sale_price: string;
  category_id: string;
  material: string;
  formats: string;
  preview_glb_url: string;
  images: string;
  weight_grams: string;
  length_cm: string;
  width_cm: string;
  height_cm: string;
  fulfilment_type: FulfilmentType;
  stock_quantity: string;
  dispatch_days: string;
  is_published: boolean;
  is_featured: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fromProduct(p: Product | null): ProductFormValues {
  return {
    title: p?.title ?? "",
    slug: p?.slug ?? "",
    description: p?.description ?? "",
    price: p ? String(p.price) : "",
    sale_price: p?.sale_price != null ? String(p.sale_price) : "",
    category_id: p?.category_id ?? "",
    material: p?.material ?? "",
    formats: p?.formats?.join(", ") ?? "",
    preview_glb_url: p?.preview_glb_url ?? "",
    images: p?.images?.join("\n") ?? "",
    weight_grams: p?.weight_grams != null ? String(p.weight_grams) : "",
    length_cm: p?.length_cm != null ? String(p.length_cm) : "",
    width_cm: p?.width_cm != null ? String(p.width_cm) : "",
    height_cm: p?.height_cm != null ? String(p.height_cm) : "",
    fulfilment_type: p?.fulfilment_type ?? "made_to_order",
    stock_quantity: String(p?.stock_quantity ?? 0),
    dispatch_days: String(p?.dispatch_days ?? 3),
    is_published: p?.is_published ?? true,
    is_featured: p?.is_featured ?? false,
  };
}

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600";
const labelCls = "flex flex-col gap-1 text-xs font-semibold text-gray-600";

export default function AdminProductForm({
  product,
  categories,
  onSaved,
  onCancel,
}: {
  product: Product | null;
  categories: Category[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<ProductFormValues>(() =>
    fromProduct(product),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) => setValues((v) => ({ ...v, [key]: value }));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    const slug = (values.slug.trim() || slugify(values.title)).toLowerCase();
    const price = Number(values.price);
    if (!values.title.trim() || !slug || !Number.isFinite(price) || price <= 0) {
      setError("Please enter a title and a valid price.");
      return;
    }
    setError(null);
    setBusy(true);
    const row = {
      title: values.title.trim(),
      slug,
      description: values.description.trim(),
      price,
      sale_price: values.sale_price.trim()
        ? Number(values.sale_price)
        : null,
      category_id: values.category_id || null,
      material: values.material.trim() || null,
      formats: values.formats
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      preview_glb_url: values.preview_glb_url.trim() || null,
      images: values.images
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean),
      weight_grams: values.weight_grams.trim()
        ? Number(values.weight_grams)
        : null,
      length_cm: values.length_cm.trim() ? Number(values.length_cm) : null,
      width_cm: values.width_cm.trim() ? Number(values.width_cm) : null,
      height_cm: values.height_cm.trim() ? Number(values.height_cm) : null,
      fulfilment_type: values.fulfilment_type,
      stock_quantity: Number(values.stock_quantity) || 0,
      dispatch_days: Number(values.dispatch_days) || 3,
      is_published: values.is_published,
      is_featured: values.is_featured,
    };
    const { error: saveError } = product
      ? await supabase.from("products").update(row).eq("id", product.id)
      : await supabase.from("products").insert(row);
    setBusy(false);
    if (saveError) {
      setError(
        saveError.message.includes("slug")
          ? "That URL slug is already used by another product."
          : `Could not save: ${saveError.message}`,
      );
      return;
    }
    onSaved();
  };

  return (
    <form
      onSubmit={save}
      className="rounded-xl border border-gray-200 bg-white p-5"
    >
      <h2 className="font-bold text-gray-900">
        {product ? `Edit: ${product.title}` : "Add a product"}
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className={labelCls}>
          Title *
          <input
            required
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            onBlur={() => {
              if (!values.slug.trim() && values.title.trim()) {
                set("slug", slugify(values.title));
              }
            }}
            className={inputCls}
          />
        </label>
        <label className={labelCls}>
          URL slug
          <input
            value={values.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="auto-generated from the title"
            className={inputCls}
          />
        </label>
        <label className={`${labelCls} sm:col-span-2`}>
          Description
          <textarea
            rows={3}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            className={inputCls}
          />
        </label>
        <label className={labelCls}>
          Price (₹) *
          <input
            required
            type="number"
            min={1}
            value={values.price}
            onChange={(e) => set("price", e.target.value)}
            className={inputCls}
          />
        </label>
        <label className={labelCls}>
          Sale price (₹) — leave blank for none
          <input
            type="number"
            min={1}
            value={values.sale_price}
            onChange={(e) => set("sale_price", e.target.value)}
            className={inputCls}
          />
        </label>
        <label className={labelCls}>
          Category
          <select
            value={values.category_id}
            onChange={(e) => set("category_id", e.target.value)}
            className={inputCls}
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          Material (e.g. PLA, PETG, Resin)
          <input
            value={values.material}
            onChange={(e) => set("material", e.target.value)}
            className={inputCls}
          />
        </label>
        <label className={labelCls}>
          Model formats (comma-separated, e.g. STL, OBJ)
          <input
            value={values.formats}
            onChange={(e) => set("formats", e.target.value)}
            className={inputCls}
          />
        </label>
        <label className={labelCls}>
          3D preview GLB URL
          <input
            value={values.preview_glb_url}
            onChange={(e) => set("preview_glb_url", e.target.value)}
            placeholder="https://…/model.glb"
            className={inputCls}
          />
        </label>
        <label className={`${labelCls} sm:col-span-2`}>
          Image URLs (one per line)
          <textarea
            rows={3}
            value={values.images}
            onChange={(e) => set("images", e.target.value)}
            placeholder="https://…/photo1.jpg"
            className={inputCls}
          />
        </label>
        <label className={labelCls}>
          Weight (grams)
          <input
            type="number"
            min={0}
            value={values.weight_grams}
            onChange={(e) => set("weight_grams", e.target.value)}
            className={inputCls}
          />
        </label>
        <label className={labelCls}>
          Dimensions L × W × H (cm)
          <span className="flex gap-2">
            <input
              type="number"
              min={0}
              step="0.1"
              placeholder="L"
              value={values.length_cm}
              onChange={(e) => set("length_cm", e.target.value)}
              className={inputCls}
            />
            <input
              type="number"
              min={0}
              step="0.1"
              placeholder="W"
              value={values.width_cm}
              onChange={(e) => set("width_cm", e.target.value)}
              className={inputCls}
            />
            <input
              type="number"
              min={0}
              step="0.1"
              placeholder="H"
              value={values.height_cm}
              onChange={(e) => set("height_cm", e.target.value)}
              className={inputCls}
            />
          </span>
        </label>
        <label className={labelCls}>
          Fulfilment
          <select
            value={values.fulfilment_type}
            onChange={(e) =>
              set("fulfilment_type", e.target.value as FulfilmentType)
            }
            className={inputCls}
          >
            <option value="made_to_order">Made to order</option>
            <option value="ready_stock">Ready stock</option>
          </select>
        </label>
        <label className={labelCls}>
          Stock quantity (ready stock only)
          <input
            type="number"
            min={0}
            value={values.stock_quantity}
            onChange={(e) => set("stock_quantity", e.target.value)}
            className={inputCls}
          />
        </label>
        <label className={labelCls}>
          Dispatch days
          <input
            type="number"
            min={0}
            value={values.dispatch_days}
            onChange={(e) => set("dispatch_days", e.target.value)}
            className={inputCls}
          />
        </label>
        <div className="flex flex-wrap items-center gap-4 pt-5 text-sm">
          <label className="flex items-center gap-2 font-medium text-gray-700">
            <input
              type="checkbox"
              checked={values.is_published}
              onChange={(e) => set("is_published", e.target.checked)}
            />
            Published (visible in the shop)
          </label>
          <label className="flex items-center gap-2 font-medium text-gray-700">
            <input
              type="checkbox"
              checked={values.is_featured}
              onChange={(e) => set("is_featured", e.target.checked)}
            />
            Featured on home page
          </label>
        </div>
      </div>
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      <div className="mt-5 flex gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-brand-700 px-5 py-2.5 font-semibold text-white hover:bg-brand-800 disabled:bg-gray-300"
        >
          {busy ? "Saving…" : product ? "Save changes" : "Add product"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
