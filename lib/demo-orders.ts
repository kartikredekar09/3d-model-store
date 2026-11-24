import type { Order } from "./types";

/**
 * Demo-mode orders, kept in the browser's localStorage so the full
 * checkout → My Orders flow works without Supabase. Live orders live in
 * the database instead; these helpers are only used in demo mode.
 */

const KEY = "demo-orders-v1";
const RETURNS_KEY = "demo-returns-v1";

export function loadDemoOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Order[]) : [];
  } catch {
    return [];
  }
}

export function saveDemoOrder(order: Order): void {
  if (typeof window === "undefined") return;
  const orders = loadDemoOrders();
  orders.unshift(order);
  window.localStorage.setItem(KEY, JSON.stringify(orders));
}

export function updateDemoOrder(
  id: string,
  patch: Partial<Order>,
): void {
  if (typeof window === "undefined") return;
  const orders = loadDemoOrders().map((o) =>
    o.id === id ? { ...o, ...patch } : o,
  );
  window.localStorage.setItem(KEY, JSON.stringify(orders));
}

export interface DemoReturn {
  id: string;
  order_id: string;
  reason: string;
  status: string;
  created_at: string;
}

export function loadDemoReturns(): DemoReturn[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RETURNS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DemoReturn[]) : [];
  } catch {
    return [];
  }
}

export function saveDemoReturn(r: DemoReturn): void {
  if (typeof window === "undefined") return;
  const list = loadDemoReturns();
  list.unshift(r);
  window.localStorage.setItem(RETURNS_KEY, JSON.stringify(list));
}
