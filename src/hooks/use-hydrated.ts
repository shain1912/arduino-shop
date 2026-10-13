"use client";

import { useSyncExternalStore } from "react";

// localStorage에 저장된 장바구니는 브라우저에서만 읽을 수 있으므로,
// 서버 렌더링 결과와 어긋나지 않도록 하이드레이션 이후에만 표시한다.
const subscribe = () => () => {};

export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
