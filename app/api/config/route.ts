import { NextResponse } from "next/server";
import { isRazorpayConfigured } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * Public capability flags for the browser: whether Supabase and Razorpay
 * are configured. No secrets are ever returned here.
 */
export async function GET() {
  return NextResponse.json({
    supabaseConfigured: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
    razorpayConfigured: isRazorpayConfigured(),
  });
}
