import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateOrderStatus } from "@/lib/actions/admin";
import { ORDER_STATUS } from "@/lib/utils/format";
import OrderDetail, { ORDER_DETAIL_SELECT, type OrderWithItems } from "@/components/checkout/OrderDetail";

export const metadata: Metadata = { title: "주문 상세" };

export default async function AdminOrderDetailPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select(ORDER_DETAIL_SELECT).eq("id", id).maybeSingle();
  if (!data) notFound();
  const order = data as unknown as OrderWithItems;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">주문 상세</h1>
        <Link href="/admin/orders" className="text-sm text-muted hover:text-ink">
          ← 주문 목록
        </Link>
      </div>

      <form
        action={updateOrderStatus.bind(null, order.id)}
        className="card mb-8 flex flex-wrap items-center gap-3 p-4"
      >
        <label htmlFor="status" className="text-sm font-semibold">
          주문 상태 변경
        </label>
        <select id="status" name="status" defaultValue={order.status} className="input w-auto">
          {Object.entries(ORDER_STATUS).map(([key, s]) => (
            <option key={key} value={key}>
              {s.label}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-dark">
          변경
        </button>
        <p className="w-full text-xs text-muted">
          결제 완료 주문을 &lsquo;주문 취소&rsquo;로 바꿔도 카드 결제는 자동 환불되지 않습니다. 토스페이먼츠
          개발자센터에서 환불을 처리해 주세요.
        </p>
      </form>

      <OrderDetail order={order} />
    </div>
  );
}
