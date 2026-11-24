"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

const MODEL_VIEWER_SRC =
  "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";

/**
 * Live 3D preview using Google's <model-viewer> web component.
 * The element is created imperatively so TypeScript needs no custom
 * JSX declarations; the component upgrades itself once the CDN script
 * loads. Drag to rotate, scroll or pinch to zoom.
 */
export default function ModelViewer({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";
    const el = document.createElement("model-viewer");
    el.setAttribute("src", src);
    el.setAttribute("alt", alt);
    el.setAttribute("camera-controls", "");
    el.setAttribute("auto-rotate", "");
    el.setAttribute("ar", "");
    el.setAttribute("shadow-intensity", "1");
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.backgroundColor = "#f0fdf4";
    container.appendChild(el);
    return () => {
      container.innerHTML = "";
    };
  }, [src, alt]);

  return (
    <>
      <Script src={MODEL_VIEWER_SRC} type="module" strategy="lazyOnload" />
      <div className="relative h-[320px] w-full overflow-hidden rounded-xl bg-brand-50 sm:h-[420px]">
        <div ref={containerRef} className="h-full w-full" />
        <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
          Drag to rotate &middot; Scroll to zoom &middot; 3D preview
        </p>
      </div>
    </>
  );
}
