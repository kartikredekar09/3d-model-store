import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-gray-900">3D Model Store</p>
          <p className="mt-2 text-sm text-gray-600">
            Custom 3D-printed figurines, home decor, prototypes and more —
            designed, printed and shipped from India.
          </p>
          <p className="mt-3 text-sm text-gray-600">
            Free shipping on orders over ₹999 · Cash on Delivery available
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-900">Shop</p>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>
              <Link href="/shop" className="hover:text-brand-700">
                All products
              </Link>
            </li>
            <li>
              <Link
                href="/shop?category=figurines"
                className="hover:text-brand-700"
              >
                Figurines
              </Link>
            </li>
            <li>
              <Link
                href="/shop?category=home-decor"
                className="hover:text-brand-700"
              >
                Home Decor
              </Link>
            </li>
            <li>
              <Link
                href="/shop?category=prototypes"
                className="hover:text-brand-700"
              >
                Prototypes
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-brand-700">
                My Orders
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-gray-900">Help &amp; policies</p>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>
              <Link href="/about" className="hover:text-brand-700">
                About us
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-brand-700">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-brand-700">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-brand-700">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-brand-700">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" className="hover:text-brand-700">
                Refund Policy
              </Link>
            </li>
            <li>
              <Link href="/licence" className="hover:text-brand-700">
                Licence terms
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} 3D Model Store. All rights reserved.
      </div>
    </footer>
  );
}
