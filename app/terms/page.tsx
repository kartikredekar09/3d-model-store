export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: November 2026</p>
      <div className="mt-6 space-y-4 text-gray-700">
        <p>
          By using 3D Model Store and placing an order, you agree to these
          terms. Please read them carefully.
        </p>
        <h2 className="pt-2 text-xl font-bold text-gray-900">Products</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            All products are physical 3D-printed objects, made to order unless
            marked as ready stock.
          </li>
          <li>
            3D printing produces fine layer lines and small variations in
            finish and colour. These are normal characteristics of the process,
            not defects.
          </li>
          <li>
            Product photos and 3D previews are as accurate as possible; colours
            may vary slightly from your screen.
          </li>
        </ul>
        <h2 className="pt-2 text-xl font-bold text-gray-900">
          Pricing and payment
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>All prices are in Indian Rupees (₹) and include all taxes.</li>
          <li>Shipping is flat ₹79, free on orders of ₹999 and above.</li>
          <li>
            You can pay online (UPI, card, netbanking via Razorpay) or choose
            Cash on Delivery.
          </li>
        </ul>
        <h2 className="pt-2 text-xl font-bold text-gray-900">
          Orders and delivery
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Made-to-order items dispatch within the number of days shown on the
            product page, then take 3–7 days by courier.
          </li>
          <li>
            Delivery times are estimates; courier delays are outside our
            control, but we will help you track a delayed parcel.
          </li>
          <li>
            Please provide a correct address and phone number. Re-delivery
            charges for a wrong address may apply.
          </li>
        </ul>
        <h2 className="pt-2 text-xl font-bold text-gray-900">
          Cash on Delivery
        </h2>
        <p>
          COD orders may be confirmed by phone before printing. If a COD order
          is refused at delivery, we may ask for advance payment on future
          orders.
        </p>
        <h2 className="pt-2 text-xl font-bold text-gray-900">
          Cancellations
        </h2>
        <p>
          You can cancel an order before it is printed for a full refund.
          Once printing has started, cancellation is not possible, but the
          return policy still applies for damaged or wrong items.
        </p>
        <h2 className="pt-2 text-xl font-bold text-gray-900">
          Intellectual property
        </h2>
        <p>
          The 3D models, product photos and designs on this site belong to 3D
          Model Store. Buying a printed product does not give you rights to
          the underlying model files. See the Licence terms page.
        </p>
        <h2 className="pt-2 text-xl font-bold text-gray-900">
          Governing law
        </h2>
        <p>
          These terms are governed by the laws of India. Any disputes will be
          handled in the courts of Kolhapur, Maharashtra.
        </p>
      </div>
    </div>
  );
}
