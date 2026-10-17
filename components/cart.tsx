"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type CartItem = { id: string; name: string; price: number; image: string | null; qty: number };
type Cart = { businessId: string | null; items: CartItem[] };

type Ctx = {
  cart: Cart;
  ready: boolean;
  add: (businessId: string, item: Omit<CartItem, "qty">) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<Ctx | null>(null);
const KEY = "hodos_cart";

function load(): Cart {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) || "null");
    if (c && Array.isArray(c.items)) return c;
  } catch {}
  return { businessId: null, items: [] };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({ businessId: null, items: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCart(load());
    setReady(true);
  }, []);

  const save = useCallback((c: Cart) => {
    setCart(c);
    try {
      localStorage.setItem(KEY, JSON.stringify(c));
    } catch {}
  }, []);

  const add: Ctx["add"] = (businessId, item) => {
    // One shop per order: adding from another shop starts a new cart.
    const base = cart.businessId && cart.businessId !== businessId ? { businessId, items: [] } : { ...cart, businessId };
    const found = base.items.find((i) => i.id === item.id);
    const items = found
      ? base.items.map((i) => (i.id === item.id ? { ...i, qty: Math.min(i.qty + 1, 99) } : i))
      : [...base.items, { ...item, qty: 1 }];
    save({ businessId, items });
  };

  const setQty: Ctx["setQty"] = (id, qty) => {
    const items = qty <= 0 ? cart.items.filter((i) => i.id !== id) : cart.items.map((i) => (i.id === id ? { ...i, qty: Math.min(qty, 99) } : i));
    save({ businessId: items.length ? cart.businessId : null, items });
  };

  const clear = () => save({ businessId: null, items: [] });

  const count = cart.items.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.items.reduce((s, i) => s + i.qty * i.price, 0);

  return <CartContext.Provider value={{ cart, ready, add, setQty, clear, count, subtotal }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
