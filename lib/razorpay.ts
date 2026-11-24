/**
 * Razorpay Checkout.js types for the browser. The checkout script is
 * loaded from https://checkout.razorpay.com/v1/checkout.js on the checkout
 * page; these types describe the `window.Razorpay` constructor it adds.
 */

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; contact?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

export interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (response: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export function isRazorpayLoaded(): boolean {
  return (
    typeof window !== "undefined" && typeof window.Razorpay === "function"
  );
}
