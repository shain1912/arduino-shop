import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPrice } from "@/lib/utils/format";
import StatusBadge from "@/components/checkout/StatusBadge";

const PAID_STATUSES = ["paid", "preparing", "shipped", "delivered"];

export default async function AdminDashboard() {
  const supabase = await createClient();
  const [{ data: orders }, { data: lowStock }, { count: productCount }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, order_no, order_name, status, total_amount, recipient, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("products").select("id, name, stock").lt("stock", 20).order("stock").limit(8),
    supabase.from("products").select("id", { count: "exact", head: true }),
  ]);

  const all = orders ?? [];
  const paid = all.filter((o) => PAID_STATUSES.includes(o.status));
  const revenue = paid.reduce((s, o) => s + o.total_amount, 0);
  const toShip = all.filter((o) => o.status === "paid" || o.status === "preparing").length;

  const stats = [
    { label: "누적 매출", value: formatPrice(revenue) },
    { label: "결제 완료 주문", value: `${paid.length}건` },
    { label: "출고 대기", value: `${toShip}건` },
    { label: "등록 상품", value: `${productCount ?? 0}개` },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold">대시보드</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-muted">{s.label}</p>
            <p className="mt-1 text-xl font-extrabold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="font-bold">최근 주문</h2>
            <Link href="/admin/orders" className="text-sm text-muted hover:text-brand-700">
              전체 →
            </Link>
          </div>
          {all.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">주문이 없습니다.</p>
          ) : (
            <ul className="divide-y divide-line">
              {all.slice(0, 8).map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface">
                    <StatusBadge status={o.status} />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium">{o.order_name}</p>
                      <p className="text-xs text-muted">
                        {o.recipient} · {formatDate(o.created_at)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">{formatPrice(o.total_amount)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card h-fit overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="font-bold">재고 부족 (20개 미만)</h2>
          </div>
          {!lowStock || lowStock.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">없음</p>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 px-4 py-2.5">
                  <span className="line-clamp-1">{p.name}</span>
                  <span className={`shrink-0 font-semibold ${p.stock === 0 ? "text-red-600" : "text-amber-600"}`}>
                    {p.stock}개
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/inventory" className="block border-t border-line px-4 py-2.5 text-center text-sm text-muted hover:text-brand-700">
            재고 관리로 이동
          </Link>
        </section>
      </div>
    </div>
  );
}
