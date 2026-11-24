import Link from "next/link";
import { notFound } from "next/navigation";
import BuyBox from "@/components/BuyBox";
import PincodeCheck from "@/components/PincodeCheck";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import { formatINR } from "@/lib/format";
import { effectivePrice, getProductBySlug, getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const price = effectivePrice(product);
  const hasDiscount =
    product.sale_price !== null && product.sale_price < product.price;
  const all = await getProducts();
  const related = all
    .filter((p) => p.id !== product.id && p.category_id === product.category_id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-sm text-gray-500">
        <Link href="/" className="hover:text-brand-700">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/shop" className="hover:text-brand-700">
          Shop
        </Link>{" "}
        / {product.category?.name ?? "Product"}
      </p>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <ProductGallery
          images={product.images}
          title={product.title}
          glbUrl={product.preview_glb_url}
        />

        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {product.title}
          </h1>
          <p className="mt-1 text-sm uppercase tracking-wide text-gray-500">
            {product.category?.name ?? "3D Print"}
            {product.material ? ` · Printed in ${product.material}` : ""}
          </p>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {formatINR(price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatINR(product.price)}
                </span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                  {Math.round(
                    (1 - (product.sale_price as number) / product.price) * 100,
                  )}
                  % off
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Inclusive of all taxes · Shipping calculated at checkout (free over
            ₹999)
          </p>

          <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm">
            {product.fulfilment_type === "made_to_order" ? (
              <p className="font-semibold text-brand-900">
                Made to order — dispatches in {product.dispatch_days} day
                {product.dispatch_days === 1 ? "" : "s"}
              </p>
            ) : product.stock_quantity > 0 ? (
              <p className="font-semibold text-brand-900">
                In stock — only {product.stock_quantity} left, ships within{" "}
                {product.dispatch_days} day
                {product.dispatch_days === 1 ? "" : "s"}
              </p>
            ) : (
              <p className="font-semibold text-red-700">Out of stock</p>
            )}
            <p className="mt-1 text-gray-600">
              Printed on demand, quality-checked and packed with care.
            </p>
          </div>

          <BuyBox product={product} />
          <PincodeCheck />
        </div>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900">About this product</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-700">
            {product.description}
          </p>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Details</h2>
          <table className="mt-2 w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-4 font-medium text-gray-600">Material</td>
                <td className="py-2 text-gray-900">
                  {product.material ?? "—"}
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-4 font-medium text-gray-600">Weight</td>
                <td className="py-2 text-gray-900">
                  {product.weight_grams ? `${product.weight_grams} g` : "—"}
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-4 font-medium text-gray-600">
                  Dimensions (L × W × H)
                </td>
                <td className="py-2 text-gray-900">
                  {product.length_cm && product.width_cm && product.height_cm
                    ? `${product.length_cm} × ${product.width_cm} × ${product.height_cm} cm`
                    : "—"}
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-4 font-medium text-gray-600">
                  Model formats
                </td>
                <td className="py-2 text-gray-900">
                  {product.formats?.join(", ") ?? "—"}
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium text-gray-600">Returns</td>
                <td className="py-2 text-gray-900">
                  7-day return/replacement for damaged, defective or wrong
                  items. See the{" "}
                  <Link href="/refund-policy" className="text-brand-700 underline">
                    Refund Policy
                  </Link>
                  .
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold text-gray-900">
            You may also like
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
