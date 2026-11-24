import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getCategories, getProducts, effectivePrice } from "@/lib/products";

export const dynamic = "force-dynamic";

interface ShopSearchParams {
  q?: string;
  category?: string;
  max?: string;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const q = (params.q ?? "").trim().toLowerCase();
  const categorySlug = params.category ?? "";
  const maxPrice = params.max ? Number(params.max) : null;

  const filtered = products.filter((p) => {
    if (q) {
      const hay = `${p.title} ${p.description} ${p.category?.name ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (categorySlug && p.category?.slug !== categorySlug) return false;
    if (maxPrice !== null && !Number.isNaN(maxPrice)) {
      if (effectivePrice(p) > maxPrice) return false;
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Shop</h1>
      <p className="mt-1 text-sm text-gray-600">
        {filtered.length} product{filtered.length === 1 ? "" : "s"}
        {q ? ` matching “${params.q}”` : ""}
      </p>

      {/* Filters — plain GET form, no client JS needed. */}
      <form
        method="get"
        className="mt-5 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4"
      >
        <label className="flex min-w-44 flex-1 flex-col gap-1 text-xs font-semibold text-gray-600">
          Search
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search products…"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-brand-600"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
          Category
          <select
            name="category"
            defaultValue={categorySlug}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-brand-600"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
          Max price
          <select
            name="max"
            defaultValue={params.max ?? ""}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-brand-600"
          >
            <option value="">No limit</option>
            <option value="299">Under ₹299</option>
            <option value="499">Under ₹499</option>
            <option value="999">Under ₹999</option>
            <option value="1499">Under ₹1,499</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          Apply filters
        </button>
        {(q || categorySlug || params.max) && (
          <Link
            href="/shop"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Clear
          </Link>
        )}
      </form>

      {filtered.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
          No products match those filters. Try a different search or category.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
