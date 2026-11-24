import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);
  const featured = products.filter((p) => p.is_featured).slice(0, 8);
  const showcase = (featured.length > 0 ? featured : products).slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-900 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:py-16 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
              Custom 3D-printed products, made to order
            </h1>
            <p className="mt-4 text-brand-100">
              Figurines, home decor, prototypes and jewellery — designed in 3D,
              printed with care, and shipped to your door. Preview every model
              in 3D before you buy.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-lg bg-white px-5 py-3 font-semibold text-brand-900 hover:bg-brand-50"
              >
                Shop all products
              </Link>
              <Link
                href="/about"
                className="rounded-lg border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10"
              >
                How it works
              </Link>
            </div>
            <p className="mt-6 text-sm text-brand-200">
              Free shipping over ₹999 · Cash on Delivery available · Secure
              payments via Razorpay
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl">
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80"
              alt="3D-printed design"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 pt-10">
        <h2 className="text-xl font-bold text-gray-900">Shop by category</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-600 hover:text-brand-700"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-6xl px-4 pt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Featured products
          </h2>
          <Link
            href="/shop"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            View all →
          </Link>
        </div>
        {showcase.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
            No products yet. Add products from the admin panel to see them here.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {showcase.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 pt-12">
        <h2 className="text-xl font-bold text-gray-900">How it works</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          {[
            {
              step: "1",
              title: "Browse & preview",
              text: "Rotate every model in 3D right in your browser before you buy.",
            },
            {
              step: "2",
              title: "Order & pay",
              text: "Pay online with UPI, card or netbanking — or choose Cash on Delivery.",
            },
            {
              step: "3",
              title: "We print it",
              text: "Your item is printed, checked and packed with care in 2–3 days.",
            },
            {
              step: "4",
              title: "Delivered to you",
              text: "Shipped by courier with tracking, anywhere in India.",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
                {s.step}
              </span>
              <p className="mt-3 font-semibold text-gray-900">{s.title}</p>
              <p className="mt-1 text-sm text-gray-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
