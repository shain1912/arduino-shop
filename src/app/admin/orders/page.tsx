import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPrice, ORDER_STATUS } from "@/lib/utils/format";
import StatusBadge from "@/components/checkout/StatusBadge";

export const metadata: Metadata = { title: "주문 관리" };

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const statusParam = (await searchParams).status;
  const status = typeof statusParam === "string" && statusParam in ORDER_STATUS ? statusParam : "";

  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("id, order_no, order_name, status, total_amount, recipient, phone, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) query = query.eq("status", status);
  const { data: orders } = await query;

  return (
    <div>
      <h1 className="text-xl font-bold">주문 관리</h1>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/orders"
          className={`rounded-full border px-3 py-1 ${!status ? "border-ink bg-ink text-white" : "border-line"}`}
        >
          전체
        </Link>
        {Object.entries(ORDER_STATUS).map(([key, s]) => (
          <Link
            key={key}
            href={`/admin/orders?status=${key}`}
            className={`rounded-full border px-3 py-1 ${status === key ? "border-ink bg-ink text-white" : "border-line"}`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-surface text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">주문번호</th>
              <th className="px-4 py-3 font-medium">상품</th>
              <th className="px-4 py-3 font-medium">주문자</th>
              <th className="px-4 py-3 text-right font-medium">금액</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">주문일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="hover:bg-surface">
                <td className="px-4 py-3 font-mono text-xs">
                  <Link href={`/admin/orders/${o.id}`} className="text-brand-700 hover:underline">
                    {o.order_no}
                  </Link>
                </td>
                <td className="max-w-56 truncate px-4 py-3">{o.order_name}</td>
                <td className="px-4 py-3">
                  {o.recipient}
                  <span className="block text-xs text-muted">{o.phone}</span>
                </td>
                <td className="px-4 py-3 text-right font-semibold">{formatPrice(o.total_amount)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3 text-xs text-muted">{formatDate(o.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!orders || orders.length === 0) && <p className="py-12 text-center text-sm text-muted">주문이 없습니다.</p>}
      </div>
    </div>
  );
}
