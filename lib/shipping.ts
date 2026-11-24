/** Shipping rules for the store (see the Physical Products Addendum). */
export const FLAT_SHIPPING_CHARGE = 79;
export const FREE_SHIPPING_THRESHOLD = 999;

/** Flat ₹79 shipping, free on orders of ₹999 and above. */
export function shippingCharge(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_CHARGE;
}
