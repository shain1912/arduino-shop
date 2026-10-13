export const FREE_SHIPPING_THRESHOLD = 30000;
export const SHIPPING_FEE = 3000;

export function shippingFeeFor(itemsAmount: number) {
  return itemsAmount >= FREE_SHIPPING_THRESHOLD || itemsAmount === 0 ? 0 : SHIPPING_FEE;
}

export function formatPrice(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "결제 대기", className: "bg-gray-100 text-gray-700" },
  paid: { label: "결제 완료", className: "bg-blue-50 text-blue-700" },
  preparing: { label: "상품 준비중", className: "bg-amber-50 text-amber-700" },
  shipped: { label: "배송중", className: "bg-indigo-50 text-indigo-700" },
  delivered: { label: "배송 완료", className: "bg-emerald-50 text-emerald-700" },
  cancelled: { label: "주문 취소", className: "bg-red-50 text-red-700" },
};

export const ORDER_STATUS_FLOW = ["pending", "paid", "preparing", "shipped", "delivered", "cancelled"];

export function specsToEntries(specs: unknown): [string, string][] {
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) return [];
  return Object.entries(specs as Record<string, unknown>).map(([k, v]) => [k, String(v)]);
}

// DB 오류 메시지 → 사용자 안내 문구
export function friendlyOrderError(message: string) {
  if (message.includes("LOGIN_REQUIRED")) return "로그인이 필요합니다.";
  if (message.includes("EMPTY_CART")) return "장바구니가 비어 있습니다.";
  if (message.includes("ADDRESS_REQUIRED")) return "배송지 정보를 모두 입력해 주세요.";
  if (message.includes("PRODUCT_NOT_FOUND")) return "판매가 종료된 상품이 있습니다. 장바구니를 확인해 주세요.";
  if (message.includes("INVALID_QUANTITY")) return "상품 수량은 1~99개까지 주문할 수 있습니다.";
  if (message.includes("OUT_OF_STOCK")) {
    const name = message.split("OUT_OF_STOCK:")[1]?.trim();
    return name ? `재고가 부족합니다: ${name}` : "재고가 부족한 상품이 있습니다.";
  }
  return "주문 처리 중 오류가 발생했습니다.";
}
