import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">
        Refund &amp; Return Policy
      </h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: November 2026</p>
      <div className="mt-6 space-y-4 text-gray-700">
        <p>
          Because our products are printed to order for you, we cannot accept
          returns for a simple change of mind. We will always make it right
          when the problem is ours.
        </p>
        <h2 className="pt-2 text-xl font-bold text-gray-900">
          You can return or replace an item when
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>It arrives damaged or broken.</li>
          <li>It has a printing defect (for example, a failed layer or a missing part).</li>
          <li>You received the wrong item.</li>
        </ul>
        <h2 className="pt-2 text-xl font-bold text-gray-900">Time limit</h2>
        <p>
          Please raise a return request within <strong>7 days of delivery</strong>{" "}
          from your{" "}
          <Link href="/orders" className="font-semibold text-brand-700 underline">
            My Orders
          </Link>{" "}
          page. Include a photo of the problem if you can — it helps us fix it
          faster.
        </p>
        <h2 className="pt-2 text-xl font-bold text-gray-900">How it works</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>You submit a return request with the reason.</li>
          <li>We review it (usually within 1 working day) and approve it.</li>
          <li>
            We arrange a pickup or ask you to ship the item back — return
            shipping for damaged, defective or wrong items is on us.
          </li>
          <li>
            You choose: a free replacement print, or a full refund to your
            original payment method (3–7 working days for the refund to appear).
          </li>
        </ol>
        <h2 className="pt-2 text-xl font-bold text-gray-900">
          What is not covered
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Change of mind after a made-to-order item is printed.</li>
          <li>
            Normal 3D-print characteristics: fine layer lines, small colour
            variation, minor surface texture.
          </li>
          <li>Damage caused after delivery (dropping, heat, misuse).</li>
          <li>Personalised items (for example, name plates) unless defective.</li>
        </ul>
        <h2 className="pt-2 text-xl font-bold text-gray-900">
          Failed payments
        </h2>
        <p>
          If your payment failed but money was deducted, the amount is refunded
          automatically by your bank or payment provider, usually within 3–7
          working days. Contact us if it takes longer.
        </p>
      </div>
    </div>
  );
}
