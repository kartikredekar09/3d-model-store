import Link from "next/link";

const FAQS: { q: string; a: string }[] = [
  {
    q: "How long does delivery take?",
    a: "Made-to-order items are printed and dispatched within 2–3 days. Courier delivery then takes 3–7 days depending on your city. Ready-stock items ship within 1 day.",
  },
  {
    q: "What is the shipping charge?",
    a: "Shipping is a flat ₹79 per order, and free on orders of ₹999 and above.",
  },
  {
    q: "Can I pay Cash on Delivery?",
    a: "Yes — COD is available on all orders. We may call to confirm COD orders before printing, to avoid fake orders.",
  },
  {
    q: "What materials do you print with?",
    a: "Mostly PLA and PETG, with wood-fill PLA, silk PLA and resin for selected pieces. Each product page lists its material.",
  },
  {
    q: "Can I get a custom design printed?",
    a: "Yes! Contact us with your idea or your own 3D file (STL/OBJ). We will quote a price based on size, material and print time.",
  },
  {
    q: "What if my item arrives damaged?",
    a: "Raise a return request from My Orders within 7 days of delivery. We will replace the item free or refund you in full — see the Refund Policy.",
  },
  {
    q: "Are the layer lines on my print normal?",
    a: "Yes. Fine layer lines are a normal characteristic of 3D printing (FDM). If a print has a genuine defect — a failed layer, a missing part — that is covered by our return policy.",
  },
  {
    q: "Do I need an account to order?",
    a: "No — guest checkout works fine. An account lets you track orders, save addresses and check out faster.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order ships, the tracking link appears on your My Orders page. You can follow the courier's tracking from there.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">
        Frequently Asked Questions
      </h1>
      <div className="mt-6 space-y-4">
        {FAQS.map((f) => (
          <details
            key={f.q}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <summary className="cursor-pointer font-semibold text-gray-900">
              {f.q}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">{f.a}</p>
          </details>
        ))}
      </div>
      <p className="mt-8 text-gray-700">
        Still stuck?{" "}
        <Link href="/contact" className="font-semibold text-brand-700 underline">
          Contact us
        </Link>{" "}
        and we will help.
      </p>
    </div>
  );
}
