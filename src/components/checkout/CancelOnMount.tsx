"use client";

import { useEffect, useRef } from "react";

// 결제 실패 페이지에서 결제 대기 주문을 정리한다 (GET 렌더링 중에는 데이터를 바꾸지 않기 위해 클라이언트에서 호출)
export default function CancelOnMount({ action }: { action: () => Promise<void> }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    action().catch(() => {});
  }, [action]);
  return null;
}
