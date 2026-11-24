"use client";

import { useState, type FormEvent } from "react";

/**
 * Simple pincode check: validates the format and shows the standard
 * delivery estimate. A live Shiprocket serviceability check can replace
 * this in a later phase (see README).
 */
export default function PincodeCheck() {
  const [pincode, setPincode] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const check = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode.trim())) {
      setMessage("Please enter a valid 6-digit pincode.");
      return;
    }
    setMessage(
      `Delivery available to ${pincode.trim()} — usually in 3–7 days after dispatch.`,
    );
  };

  return (
    <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm font-semibold text-gray-900">
        Check delivery to your pincode
      </p>
      <form onSubmit={check} className="mt-2 flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
          placeholder="e.g. 416115"
          className="w-36 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
          aria-label="Pincode"
        />
        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Check
        </button>
      </form>
      {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
