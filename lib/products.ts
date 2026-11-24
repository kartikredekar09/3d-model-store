import { DEMO_CATEGORIES, DEMO_PRODUCTS } from "./demo-products";
import { getServiceSupabase } from "./supabase-server";
import type { Category, Product } from "./types";

/**
 * Product data access. Reads from Supabase when it is configured, and
 * falls back to the demo catalogue otherwise (or when the query fails),
 * so pages always render.
 */

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
    created_at:
      typeof row.created_at === "string" ? row.created_at : undefined,
  };
}

function asCategory(row: Row): Category {
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
  };
}

export async function getCategories(): Promise<Category[]> {
  const supabase = getServiceSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug")
      .order("name");
    if (!error && data) return (data as Row[]).map(asCategory);
  }
  return DEMO_CATEGORIES;
}

export async function getProducts(): Promise<Product[]> {
  const categories = await getCategories();
  const supabase = getServiceSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (!error && data) {
      return (data as Row[]).map((row) => asProduct(row, categories));
    }
  }
  return DEMO_PRODUCTS;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const categories = await getCategories();
  const supabase = getServiceSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (!error && data) return asProduct(data as Row, categories);
    if (!error && !data) return null;
  }
  return DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

/** Effective selling price (sale price wins when set). */
export function effectivePrice(product: Product): number {
  return product.sale_price ?? product.price;
}
