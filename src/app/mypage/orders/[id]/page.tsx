import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cancelPendingOrder } from "@/lib/actions/orders";
import OrderDetail, { ORDER_DETAIL_SELECT, type OrderWithItems } from "@/components/checkout/OrderDetail";

export const metadata: Metadata = { title: "주문 상세" };

export default async function MyOrderDetailPage({ params }: PageProps<"/mypage/orders/[id]">) {
  const { id } = await params;
  const user = await requireUser(`/mypage/orders/${id}`);
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select(ORDER_DETAIL_SELECT)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) notFound();
  const order = data as unknown as OrderWithItems;

  async function cancel() {
    "use server";
    await cancelPendingOrder(id);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">주문 상세</h1>
        <Link href="/mypage" className="text-sm text-muted hover:text-ink">
          ← 주문 내역
        </Link>
      </div>
      <OrderDetail order={order} />
      {order.status === "pending" && (
        <form action={cancel} className="mt-8 flex flex-wrap items-center justify-end gap-3">
          <p className="text-sm text-muted">결제가 완료되지 않은 주문입니다.</p>
          <button type="submit" className="btn-outline">
            주문 취소
          </button>
        </form>
      )}
      {order.status === "paid" && (
        <p className="mt-8 rounded-lg bg-surface px-4 py-3 text-sm text-muted">
          결제 완료 후 취소·환불은 고객센터로 문의해 주세요.
        </p>
      )}
    </div>
  );
}
