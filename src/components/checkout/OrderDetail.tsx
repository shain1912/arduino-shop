import Image from "next/image";
import type { Tables } from "@/types/database";
import { formatDate, formatPrice } from "@/lib/utils/format";
import StatusBadge from "./StatusBadge";

export type OrderWithItems = Tables<"orders"> & {
  order_items: Tables<"order_items">[];
  payments: Pick<Tables<"payments">, "method" | "amount" | "approved_at" | "payment_key">[];
};

export const ORDER_DETAIL_SELECT =
  "*, order_items(*), payments(method, amount, approved_at, payment_key)" as const;

// 마이페이지와 관리자 화면에서 함께 쓰는 주문 상세
export default function OrderDetail({ order }: { order: OrderWithItems }) {
  const payment = order.payments[0];
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={order.status} />
        <span className="font-mono text-sm">{order.order_no}</span>
        <span className="text-sm text-muted">주문일 {formatDate(order.created_at)}</span>
      </div>

      <section>
        <h2 className="border-b border-ink pb-3 font-bold">주문 상품</h2>
        <ul className="divide-y divide-line">
          {order.order_items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-white">
                {item.product_image && (
                  <Image src={item.product_image} alt="" fill sizes="64px" className="object-contain p-1" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium">{item.product_name}</p>
                <p className="text-xs text-muted">
                  {formatPrice(item.unit_price)} × {item.quantity}개
                </p>
              </div>
              <p className="text-sm font-bold">{formatPrice(item.unit_price * item.quantity)}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-xl bg-surface p-5 text-sm">
          <h2 className="font-bold">배송 정보</h2>
          <dl className="mt-3 space-y-1.5">
            <div className="flex gap-3">
              <dt className="w-16 shrink-0 text-muted">받는 분</dt>
              <dd>{order.recipient}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-16 shrink-0 text-muted">연락처</dt>
              <dd>{order.phone}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-16 shrink-0 text-muted">주소</dt>
              <dd>
                ({order.zipcode}) {order.address1} {order.address2}
              </dd>
            </div>
            {order.memo && (
              <div className="flex gap-3">
                <dt className="w-16 shrink-0 text-muted">메모</dt>
                <dd>{order.memo}</dd>
              </div>
            )}
          </dl>
        </section>
        <section className="rounded-xl bg-surface p-5 text-sm">
          <h2 className="font-bold">결제 정보</h2>
          <dl className="mt-3 space-y-1.5">
            <div className="flex justify-between">
              <dt className="text-muted">상품 금액</dt>
              <dd>{formatPrice(order.items_amount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">배송비</dt>
              <dd>{order.shipping_fee === 0 ? "무료" : formatPrice(order.shipping_fee)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 font-bold">
              <dt>총 결제금액</dt>
              <dd className="text-brand-700">{formatPrice(order.total_amount)}</dd>
            </div>
            {payment && (
              <>
                <div className="flex justify-between pt-2">
                  <dt className="text-muted">결제수단</dt>
                  <dd>{payment.method || "-"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">결제일시</dt>
                  <dd>{formatDate(payment.approved_at)}</dd>
                </div>
              </>
            )}
          </dl>
        </section>
      </div>
    </div>
  );
}
