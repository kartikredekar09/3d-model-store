import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; method?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.order ?? "";
  const method = params.method ?? "cod";
  const isDemo = orderId.startsWith("DEMO-");

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-3xl text-brand-700">
        ✓
      </span>
      <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">
        Order placed successfully!
      </h1>
      <p className="mt-2 text-gray-600">
        Thank you for your order. We&rsquo;ll start printing it right away.
      </p>
      {orderId && (
        <p className="mt-4 inline-block rounded-lg bg-gray-100 px-4 py-2 font-mono text-sm text-gray-800">
          Order ID: {orderId}
        </p>
      )}
      {isDemo && (
        <p className="mx-auto mt-4 max-w-md rounded-lg bg-amber-100 px-4 py-2 text-sm text-amber-900">
          Demo mode — this order is stored in your browser only. Connect
          Supabase to save real orders.
        </p>
      )}
      <div className="mx-auto mt-8 max-w-md rounded-xl border border-gray-200 bg-white p-5 text-left text-sm">
        <p className="font-bold text-gray-900">What happens next</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-gray-700">
          <li>
            We confirm your order
            {method === "cod"
              ? " (we may call to confirm Cash on Delivery orders)"
              : " and your payment"}
            .
          </li>
          <li>Your item is printed, checked and packed (2–3 days).</li>
          <li>It ships by courier — you&rsquo;ll get a tracking link.</li>
          <li>Delivery in 3–7 days after dispatch.</li>
        </ol>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/orders"
          className="rounded-lg bg-brand-700 px-5 py-3 font-semibold text-white hover:bg-brand-800"
        >
          Track my orders
        </Link>
        <Link
          href="/shop"
          className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
