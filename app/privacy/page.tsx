export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: November 2026</p>
      <div className="mt-6 space-y-4 text-gray-700">
        <p>
          3D Model Store (&ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your
          privacy. This policy explains what data we collect when you use this
          website, and what we do with it.
        </p>
        <h2 className="pt-2 text-xl font-bold text-gray-900">
          What we collect
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Account details</strong> — your name and email address
            when you create an account.
          </li>
          <li>
            <strong>Order details</strong> — delivery name, phone number,
            address and pincode, so we can print and ship your order.
          </li>
          <li>
            <strong>Order history</strong> — what you bought, when, and the
            order status.
          </li>
        </ul>
        <h2 className="pt-2 text-xl font-bold text-gray-900">
          What we never collect
        </h2>
        <p>
          We never see, store or handle your card numbers, UPI PINs, OTPs or
          bank passwords. Online payments are processed entirely by Razorpay on
          their secure pages; we only receive a payment ID and a status.
        </p>
        <h2 className="pt-2 text-xl font-bold text-gray-900">
          How we use your data
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>To print, pack, ship and deliver your orders.</li>
          <li>To confirm orders and share tracking information.</li>
          <li>To handle returns, replacements and support requests.</li>
          <li>To confirm Cash on Delivery orders by phone or WhatsApp.</li>
        </ul>
        <h2 className="pt-2 text-xl font-bold text-gray-900">
          Who we share it with
        </h2>
        <p>
          Your delivery details are shared with our courier partners
          (booked through Shiprocket) so they can deliver your order, and
          with Razorpay for payment processing. We do not sell your data to
          anyone.
        </p>
        <h2 className="pt-2 text-xl font-bold text-gray-900">Your choices</h2>
        <p>
          You can ask us to correct or delete your account data at any time by
          contacting us. Order records needed for tax and accounting may be
          kept as required by law.
        </p>
        <h2 className="pt-2 text-xl font-bold text-gray-900">Security</h2>
        <p>
          This site uses HTTPS everywhere, passwords are stored hashed by our
          authentication provider (Supabase Auth), and access to customer data
          is limited to the store owner.
        </p>
      </div>
    </div>
  );
}
