import { NextResponse, type NextRequest } from "next/server";
import Razorpay from "razorpay";
import { effectivePrice, getProducts } from "@/lib/products";
import { shippingCharge } from "@/lib/shipping";
import {
  getServiceSupabase,
  isRazorpayConfigured,
} from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

interface CheckoutItemInput {
  productId: string;
  qty: number;
}

interface CheckoutBody {
  items?: CheckoutItemInput[];
  address?: {
    full_name?: string;
    phone?: string;
    address_line?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  paymentMethod?: string;
  userId?: string | null;
}

function isValidBody(body: unknown): body is CheckoutBody {
  return typeof body === "object" && body !== null;
}

/**
 * POST /api/checkout/create-order
 *
 * Creates an order. Prices are always calculated on the server from the
 * catalogue — the browser's prices are never trusted.
 *
 * - COD: the order is confirmed immediately (the courier collects the cash).
 * - Prepaid: a Razorpay order is created and the order stays "pending"
 *   until the webhook verifies the payment.
 *
 * In demo mode (no Supabase) a COD order returns a demo order id and the
 * browser stores the order locally; prepaid is unavailable.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!isValidBody(body)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { items, address, paymentMethod } = body;
  const userId =
    typeof body.userId === "string" && body.userId ? body.userId : null;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }
  if (paymentMethod !== "cod" && paymentMethod !== "prepaid") {
    return NextResponse.json(
      { error: "Choose a payment method." },
      { status: 400 },
    );
  }
  if (
    !address ||
    !address.full_name?.trim() ||
    !/^\d{10}$/.test((address.phone ?? "").replace(/\s/g, "")) ||
    !address.address_line?.trim() ||
    !address.city?.trim() ||
    !address.state?.trim() ||
    !/^\d{6}$/.test(address.pincode ?? "")
  ) {
    return NextResponse.json(
      { error: "Please fill in a complete delivery address." },
      { status: 400 },
    );
  }

  // Validation above guarantees all address fields are present;
  // normalise the phone number once here so TypeScript is happy.
  const phone = (address.phone ?? "").replace(/\s/g, "");

  // Server-side price calculation from the catalogue.
  const products = await getProducts();
  const byId = new Map(products.map((p) => [p.id, p]));
  let subtotal = 0;
  const lines: { productId: string; title: string; price: number; qty: number }[] =
    [];
  for (const item of items) {
    const qty = Number(item?.qty);
    const product = item ? byId.get(String(item.productId)) : undefined;
    if (!product || !Number.isInteger(qty) || qty < 1 || qty > 99) {
      return NextResponse.json(
        { error: "One of the items in your cart is no longer available." },
        { status: 400 },
      );
    }
    const price = effectivePrice(product);
    subtotal += price * qty;
    lines.push({ productId: product.id, title: product.title, price, qty });
  }
  const shipping = shippingCharge(subtotal);
  const total = subtotal + shipping;

  const supabase = getServiceSupabase();

  // --- Cash on Delivery ---
  if (paymentMethod === "cod") {
    if (!supabase) {
      return NextResponse.json({
        ok: true,
        demo: true,
        orderId: `DEMO-${Date.now().toString(36).toUpperCase()}`,
        total,
      });
    }
    const { data: addressRow, error: addressError } = await supabase
      .from("addresses")
      .insert({
        user_id: userId,
        full_name: address.full_name.trim(),
        phone,
        address_line: address.address_line.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        pincode: address.pincode,
      })
      .select("id")
      .single();
    if (addressError || !addressRow) {
      return NextResponse.json(
        { error: "Could not save the delivery address." },
        { status: 500 },
      );
    }
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        address_id: addressRow.id,
        subtotal,
        shipping_charge: shipping,
        total,
        status: "confirmed",
        payment_status: "pending",
        payment_method: "cod",
      })
      .select("id")
      .single();
    if (orderError || !order) {
      return NextResponse.json(
        { error: "Could not create the order." },
        { status: 500 },
      );
    }
    const { error: itemsError } = await supabase.from("order_items").insert(
      lines.map((l) => ({
        order_id: order.id,
        product_id: l.productId,
        title: l.title,
        price: l.price,
        quantity: l.qty,
      })),
    );
    if (itemsError) {
      return NextResponse.json(
        { error: "Could not save the order items." },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, orderId: order.id, total });
  }

  // --- Prepaid via Razorpay ---
  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: "Online payments are not set up yet. Please use Cash on Delivery." },
      { status: 400 },
    );
  }
  if (!supabase) {
    return NextResponse.json(
      { error: "Online payments need a database connection. Please use Cash on Delivery." },
      { status: 400 },
    );
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET as string,
  });
  let razorpayOrder: { id: string };
  try {
    razorpayOrder = await razorpay.orders.create({
      amount: total * 100, // paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: { customer: address.full_name.trim() },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not start the payment. Please try again." },
      { status: 502 },
    );
  }

  const { data: addressRow, error: addressError } = await supabase
    .from("addresses")
    .insert({
      user_id: userId,
      full_name: address.full_name.trim(),
      phone,
      address_line: address.address_line.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      pincode: address.pincode,
    })
    .select("id")
    .single();
  if (addressError || !addressRow) {
    return NextResponse.json(
      { error: "Could not save the delivery address." },
      { status: 500 },
    );
  }
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      address_id: addressRow.id,
      subtotal,
      shipping_charge: shipping,
      total,
      status: "pending",
      payment_status: "pending",
      payment_method: "prepaid",
      razorpay_order_id: razorpayOrder.id,
    })
    .select("id")
    .single();
  if (orderError || !order) {
    return NextResponse.json(
      { error: "Could not create the order." },
      { status: 500 },
    );
  }
  const { error: itemsError } = await supabase.from("order_items").insert(
    lines.map((l) => ({
      order_id: order.id,
      product_id: l.productId,
      title: l.title,
      price: l.price,
      quantity: l.qty,
    })),
  );
  if (itemsError) {
    return NextResponse.json(
      { error: "Could not save the order items." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    razorpayOrderId: razorpayOrder.id,
    keyId: process.env.RAZORPAY_KEY_ID,
    amount: total * 100,
    currency: "INR",
    total,
  });
}
