import { isSupabaseConfigured } from "@/lib/supabase";

/**
 * Shown at the top of every page while Supabase is not configured, so it
 * is always obvious the store is running on sample data.
 */
export default function DemoBanner() {
  if (isSupabaseConfigured()) return null;
  return (
    <div className="bg-amber-100 px-4 py-2 text-center text-xs text-amber-900 sm:text-sm">
      <strong>Demo mode</strong> — showing sample products. Connect Supabase
      (see README) to list real products, and Razorpay to accept online
      payments. Cash on Delivery works in demo mode.
    </div>
  );
}
