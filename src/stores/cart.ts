"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  image: string;
  price: number;
  stock: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  // DB의 최신 가격·재고로 덮어쓴다. 목록에 없는 상품(판매 종료)은 빠진다.
  sync: (latest: Omit<CartItem, "quantity">[]) => void;
};

const MAX_QUANTITY = 99;

function clampQuantity(quantity: number, stock: number) {
  return Math.max(1, Math.min(quantity, stock, MAX_QUANTITY));
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, ...item, quantity: clampQuantity(i.quantity + quantity, item.stock) }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: clampQuantity(quantity, item.stock) }] };
        }),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: clampQuantity(quantity, i.stock) } : i,
          ),
        })),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
      sync: (latest) =>
        set((state) => ({
          items: state.items.flatMap((i) => {
            const fresh = latest.find((p) => p.productId === i.productId);
            if (!fresh || fresh.stock <= 0) return [];
            return [{ ...fresh, quantity: clampQuantity(i.quantity, fresh.stock) }];
          }),
        })),
    }),
    { name: "arduino-shop-cart" },
  ),
);

export function cartTotals(items: CartItem[]) {
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const amount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return { count, amount };
}
