"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/stores/cart";

// 장바구니에 담긴 상품의 가격·재고를 DB 기준으로 맞춘다.
// 반환값: 동기화 완료 여부, 판매 종료·품절로 빠진 상품 수
export function useCartSync() {
  const [synced, setSynced] = useState(false);
  const [removedCount, setRemovedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const items = useCart.getState().items;
      if (items.length === 0) {
        setSynced(true);
        return;
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("id, slug, name, image, price, stock")
        .in(
          "id",
          items.map((i) => i.productId),
        );
      if (cancelled) return;
      if (!error && data) {
        const latest = data.map((p) => ({
          productId: p.id,
          slug: p.slug,
          name: p.name,
          image: p.image,
          price: p.price,
          stock: p.stock,
        }));
        const before = items.length;
        useCart.getState().sync(latest);
        setRemovedCount(before - useCart.getState().items.length);
      }
      setSynced(true);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { synced, removedCount };
}
