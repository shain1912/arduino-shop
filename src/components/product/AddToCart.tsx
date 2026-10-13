"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/stores/cart";
import { formatPrice } from "@/lib/utils/format";
import QuantityInput from "@/components/cart/QuantityInput";

export default function AddToCart({ product }: { product: Omit<CartItem, "quantity"> }) {
  const add = useCart((s) => s.add);
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  function handleAdd() {
    add(product, quantity);
    setAdded(true);
  }

  function handleBuyNow() {
    add(product, quantity);
    router.push("/cart");
  }

  if (soldOut) {
    return (
      <button type="button" className="btn-dark w-full py-3.5" disabled>
        일시 품절
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3">
        <QuantityInput value={quantity} max={Math.min(product.stock, 99)} onChange={setQuantity} />
        <p className="text-lg font-bold">{formatPrice(product.price * quantity)}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={handleAdd} className="btn-outline py-3.5">
          장바구니 담기
        </button>
        <button type="button" onClick={handleBuyNow} className="btn-primary py-3.5">
          바로 구매
        </button>
      </div>
      {added && (
        <p className="flex items-center justify-between rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-900">
          장바구니에 담았습니다.
          <button type="button" onClick={() => router.push("/cart")} className="font-semibold underline">
            장바구니 보기
          </button>
        </p>
      )}
    </div>
  );
}
