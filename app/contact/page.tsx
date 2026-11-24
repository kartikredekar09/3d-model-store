"use client";

import { useState, type FormEvent } from "react";

/**
 * Contact form. This MVP version confirms the message in the browser
 * only — connect an email service (e.g. Resend) in a later phase to
 * actually deliver messages. The store email below is a placeholder:
 * replace it with the real support address before launch.
 */
export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Contact us</h1>
      <p className="mt-2 text-gray-700">
        Questions about an order, a custom print, or bulk pricing? Write to us
        — we usually reply within one working day.
      </p>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-700">
        <p>
          <strong>Email:</strong> support@example.com{" "}
          <span className="text-gray-500">
            (replace with the store&apos;s real address before launch)
          </span>
        </p>
        <p className="mt-1">
          <strong>Hours:</strong> Monday–Saturday, 10 AM – 7 PM IST
        </p>
      </div>
      {sent ? (
        <p className="mt-6 rounded-lg bg-brand-50 px-4 py-3 font-medium text-brand-900">
          Thank you, {name || "friend"}! Your message has been noted. We will
          get back to you at {email} soon.
        </p>
      ) : (
        <form
          onSubmit={submit}
          className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-5"
        >
          <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
            Your name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-brand-600"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
            Your email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-brand-600"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
            Message
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-brand-600"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-brand-700 px-5 py-3 font-semibold text-white hover:bg-brand-800"
          >
            Send message
          </button>
        </form>
      )}
    </div>
  );
}
