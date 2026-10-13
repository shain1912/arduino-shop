"use client";

import Link from "next/link";
import { cartTotals, useCart } from "@/stores/cart";
import { useHydrated } from "@/hooks/use-hydrated";

export default function CartButton() {
  const items = useCart((s) => s.items);
  const hydrated = useHydrated();
  const { count } = cartTotals(items);

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-ink hover:bg-surface"
      aria-label={`장바구니 ${hydrated ? count : 0}개`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9.5" cy="19.5" r="1.3" />
        <circle cx="17" cy="19.5" r="1.3" />
      </svg>
      <span className="hidden sm:inline">장바구니</span>
      {hydrated && count > 0 && (
        <span className="absolute -top-0.5 left-6 min-w-5 rounded-full bg-brand-500 px-1.5 text-center text-[11px] font-bold leading-5 text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
