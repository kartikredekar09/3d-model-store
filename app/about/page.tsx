import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">About us</h1>
      <div className="mt-6 space-y-4 text-gray-700">
        <p>
          3D Model Store is a small Indian business built around one idea:
          great 3D design should be something you can hold in your hands.
          Every product in our shop starts as a 3D model designed in-house,
          and is printed to order on our own printers.
        </p>
        <p>
          Because we print to order, there is no warehouse full of unsold
          stock — your item is printed, quality-checked and packed
          especially for you, usually within 2–3 days of your order.
        </p>
        <h2 className="pt-2 text-xl font-bold text-gray-900">
          What we print
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Figurines</strong> — characters, animals and collectibles.
          </li>
          <li>
            <strong>Home decor</strong> — vases, clocks, organisers and
            personalised name plates.
          </li>
          <li>
            <strong>Prototypes</strong> — enclosures and parts for makers,
            students and product teams.
          </li>
          <li>
            <strong>Jewellery &amp; accessories</strong> — lightweight,
            wearable 3D-printed pieces.
          </li>
        </ul>
        <h2 className="pt-2 text-xl font-bold text-gray-900">
          Materials we use
        </h2>
        <p>
          Most products are printed in PLA or PETG — durable, everyday
          plastics that are safe for home use. Selected pieces use wood-fill
          PLA, silk PLA or resin for a special finish. The material of each
          product is listed on its page.
        </p>
        <p>
          Questions, custom orders or bulk prints?{" "}
          <Link href="/contact" className="font-semibold text-brand-700 underline">
            Contact us
          </Link>{" "}
          — we love a challenge.
        </p>
      </div>
    </div>
  );
}
