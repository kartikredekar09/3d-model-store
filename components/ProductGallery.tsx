"use client";

import { useState } from "react";
import ModelViewer from "@/components/ModelViewer";

/**
 * Product media: image thumbnails plus a 3D preview tab.
 */
export default function ProductGallery({
  images,
  title,
  glbUrl,
}: {
  images: string[];
  title: string;
  glbUrl: string | null;
}) {
  const [view, setView] = useState<"3d" | number>(glbUrl ? "3d" : 0);
  const mainImage = images[0] ?? "/next.svg";

  return (
    <div>
      {view === "3d" && glbUrl ? (
        <ModelViewer src={glbUrl} alt={`3D preview of ${title}`} />
      ) : (
        <img
          src={typeof view === "number" ? (images[view] ?? mainImage) : mainImage}
          alt={title}
          className="aspect-[4/3] w-full rounded-xl border border-gray-200 object-cover"
        />
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {glbUrl && (
          <button
            type="button"
            onClick={() => setView("3d")}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
              view === "3d"
                ? "border-brand-700 bg-brand-50 text-brand-800"
                : "border-gray-300 text-gray-700 hover:border-brand-600"
            }`}
          >
            3D preview
          </button>
        )}
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setView(i)}
            className={`overflow-hidden rounded-lg border-2 ${
              view === i ? "border-brand-700" : "border-transparent"
            }`}
            aria-label={`View image ${i + 1}`}
          >
            <img
              src={src}
              alt={`${title} — image ${i + 1}`}
              className="h-16 w-20 object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
