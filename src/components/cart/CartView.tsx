"use client";

import Link from "next/link";
import Image from "next/image";
import { cartTotals, useCart } from "@/stores/cart";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCartSync } from "@/hooks/use-cart-sync";
import { formatPrice, shippingFeeFor, FREE_SHIPPING_THRESHOLD } from "@/lib/utils/format";
import QuantityInput from "./QuantityInput";

export default function CartView() {
  const hydrated = useHydrated();
  const { synced, removedCount } = useCartSync();
  const { items, setQuantity, remove, clear } = useCart();
  const { amount } = cartTotals(items);
  const shipping = shippingFeeFor(amount);

  if (!hydrated || !synced) {
    return <div className="mt-8 h-48 animate-pulse rounded-xl bg-surface" />;
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-line py-20 text-center">
        {removedCount > 0 && (
          <p className="mb-2 text-sm text-red-600">판매가 종료되었거나 품절된 상품이 장바구니에서 빠졌습니다.</p>
        )}
        <p className="text-muted">장바구니가 비어 있습니다.</p>
        <Link href="/products" className="btn-primary mt-5">
          쇼핑 계속하기
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        {removedCount > 0 && (
          <p className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            판매가 종료되었거나 품절된 상품 {removedCount}개가 장바구니에서 빠졌습니다.
          </p>
        )}
        <div className="flex items-center justify-between border-b border-ink pb-3 text-sm">
          <span className="font-semibold">상품 {items.length}종</span>
          <button type="button" onClick={clear} className="text-muted hover:text-red-600">
            전체 삭제
          </button>
        </div>
        <ul className="divide-y divide-line">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 py-5">
              <Link
                href={`/products/${item.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-line bg-white"
              >
                {item.image && (
                  <Image src={item.image} alt={item.name} fill sizes="96px" className="object-contain p-1.5" />
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Link href={`/products/${item.slug}`} className="line-clamp-2 font-medium hover:text-brand-700">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted">{formatPrice(item.price)}</p>
                  {item.stock < 10 && <p className="mt-0.5 text-xs text-red-600">재고 {item.stock}개</p>}
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <QuantityInput
                    value={item.quantity}
                    max={Math.min(item.stock, 99)}
                    onChange={(q) => setQuantity(item.productId, q)}
                  />
                  <p className="w-24 text-right font-bold">{formatPrice(item.price * item.quantity)}</p>
                  <button
                    type="button"
                    onClick={() => remove(item.productId)}
                    className="text-muted hover:text-red-600"
                    aria-label={`${item.name} 삭제`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit rounded-xl bg-surface p-5 lg:sticky lg:top-36">
        <h2 className="font-bold">결제 예정 금액</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">상품 금액</dt>
            <dd>{formatPrice(amount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">배송비</dt>
            <dd>{shipping === 0 ? "무료" : formatPrice(shipping)}</dd>
          </div>
        </dl>
        {shipping > 0 && (
          <p className="mt-2 text-xs text-brand-700">
            {formatPrice(FREE_SHIPPING_THRESHOLD - amount)} 더 담으면 무료배송
          </p>
        )}
        <div className="mt-4 flex justify-between border-t border-line pt-4">
          <span className="font-semibold">합계</span>
          <span className="text-xl font-extrabold">{formatPrice(amount + shipping)}</span>
        </div>
        <Link href="/checkout" className="btn-primary mt-5 w-full py-3.5">
          주문하기
        </Link>
      </aside>
    </div>
  );
}
