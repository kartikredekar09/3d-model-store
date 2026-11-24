export default function LicencePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Licence Terms</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: November 2026</p>
      <div className="mt-6 space-y-4 text-gray-700">
        <p>
          When you buy a product from 3D Model Store, you are buying a
          physical printed object — not the 3D model file or the design
          rights behind it.
        </p>
        <h2 className="pt-2 text-xl font-bold text-gray-900">
          What you may do with your printed product
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Use it, display it and gift it freely.</li>
          <li>Photograph it and share photos online.</li>
        </ul>
        <h2 className="pt-2 text-xl font-bold text-gray-900">
          What you may not do
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Copy, scan or reverse-engineer the design to reproduce or sell
            copies of it.
          </li>
          <li>
            Use our product photos, 3D previews or designs in your own shop
            or marketing without permission.
          </li>
          <li>Claim the design as your own work.</li>
        </ul>
        <h2 className="pt-2 text-xl font-bold text-gray-900">
          Commercial use
        </h2>
        <p>
          If you are a business and want to resell our printed products, use
          our designs in your own products, or license a model for your own
          printing, please contact us for a commercial arrangement.
        </p>
      </div>
    </div>
  );
}
