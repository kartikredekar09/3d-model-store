import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

interface RazorpayEvent {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
      };
    };
  };
}

/**
 * POST /api/webhooks/razorpay
 *
 * Razorpay calls this after a payment. The webhook signature is verified
 * with RAZORPAY_WEBHOOK_SECRET — this is the only proof a payment is
 * real. Only after verification is the order marked paid/confirmed.
 * Never mark an order paid from anything the browser reports.
 *
 * Configure the webhook URL in the Razorpay dashboard:
 * https://your-domain.com/api/webhooks/razorpay
 * and subscribe to the `payment.captured` event.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret is not configured." },
      { status: 500 },
    );
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const sigBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const valid =
    sigBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: RazorpayEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const payment = event.payload?.payment?.entity;
    const razorpayOrderId = payment?.order_id;
    if (razorpayOrderId) {
      const supabase = getServiceSupabase();
      if (supabase) {
        await supabase
          .from("orders")
          .update({
            status: "confirmed",
            payment_status: "paid",
            razorpay_payment_id: payment?.id ?? null,
          })
          .eq("razorpay_order_id", razorpayOrderId);
      }
    }
  }

  return NextResponse.json({ received: true });
}
