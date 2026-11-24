// Shared types for the 3D Model Store (physical 3D-printed products).
// Prices are integer rupees (₹). See supabase/schema.sql for the database
// tables these types mirror.

export type FulfilmentType = "made_to_order" | "ready_stock";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  /** Price in whole rupees. */
  price: number;
  /** Discounted price in whole rupees, or null for no discount. */
  sale_price: number | null;
  category_id: string | null;
  category?: Category | null;
  /** Print material, e.g. "PLA", "PETG", "Resin". */
  material: string | null;
  /** Source model formats, e.g. ["STL", "OBJ"]. Informational only. */
  formats: string[] | null;
  /** URL of the small GLB used for the live 3D preview. */
  preview_glb_url: string | null;
  images: string[];
  weight_grams: number | null;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  fulfilment_type: FulfilmentType;
  stock_quantity: number;
  dispatch_days: number;
  is_published: boolean;
  is_featured: boolean;
  created_at?: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "printing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "prepaid" | "cod";

export interface Address {
  id?: string;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  id?: string;
  product_id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string | null;
}

export interface Shipment {
  id?: string;
  order_id: string;
  courier_name: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  status: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
}

export interface Order {
  id: string;
  user_id: string | null;
  address: Address | null;
  items: OrderItem[];
  subtotal: number;
  shipping_charge: number;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  shipment: Shipment | null;
  created_at: string;
}

export type ReturnStatus = "requested" | "approved" | "rejected" | "completed";

export interface ReturnRequest {
  id: string;
  order_id: string;
  user_id: string | null;
  reason: string;
  status: ReturnStatus;
  created_at: string;
}

/** The ordered steps shown in the customer order timeline. */
export const ORDER_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "confirmed", label: "Confirmed" },
  { key: "printing", label: "Printing" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

/** Statuses the admin can set on an order. */
export const ADMIN_ORDER_STATUSES: { key: OrderStatus; label: string }[] = [
  ...ORDER_STEPS,
  { key: "cancelled", label: "Cancelled" },
  { key: "refunded", label: "Refunded" },
];
