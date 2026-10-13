import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPrice } from "@/lib/utils/format";
import StatusBadge from "@/components/checkout/StatusBadge";

export const metadata: Metadata = { title: "주문 내역" };

export default async function MyOrdersPage() {
  const user = await requireUser("/mypage");
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_no, order_name, status, total_amount, created_at, order_items(product_image)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-bold">주문 내역</h1>
      {!orders || orders.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-line py-20 text-center">
          <p className="text-muted">아직 주문한 상품이 없습니다.</p>
          <Link href="/products" className="btn-primary mt-5">
            쇼핑하러 가기
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/mypage/orders/${o.id}`}
                className="card flex items-center gap-4 p-4 transition hover:border-brand-500"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-white">
                  {o.order_items[0]?.product_image && (
                    <Image
                      src={o.order_items[0].product_image}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={o.status} />
                    <span className="text-xs text-muted">{formatDate(o.created_at)}</span>
                  </div>
                  <p className="mt-1 line-clamp-1 font-medium">{o.order_name}</p>
                  <p className="font-mono text-xs text-muted">{o.order_no}</p>
                </div>
                <p className="font-bold">{formatPrice(o.total_amount)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
