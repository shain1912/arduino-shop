import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { toggleActive, updateStock } from "@/lib/actions/admin";

export const metadata: Metadata = { title: "재고 관리" };

export default async function InventoryPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, stock, is_active, categories(name)")
    .order("stock")
    .order("id");

  return (
    <div>
      <h1 className="text-xl font-bold">재고 관리</h1>
      <p className="mt-1 text-sm text-muted">재고가 적은 순으로 표시합니다. 결제가 완료되면 재고가 자동으로 차감됩니다.</p>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-surface text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">상품</th>
              <th className="px-4 py-3 font-medium">카테고리</th>
              <th className="px-4 py-3 font-medium">재고 수정</th>
              <th className="px-4 py-3 font-medium">판매</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(products ?? []).map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2.5">
                  <span className="line-clamp-1">{p.name}</span>
                </td>
                <td className="px-4 py-2.5 text-muted">{p.categories?.name}</td>
                <td className="px-4 py-2.5">
                  <form action={updateStock.bind(null, p.id)} className="flex items-center gap-2">
                    <input
                      name="stock"
                      type="number"
                      min={0}
                      defaultValue={p.stock}
                      className={`input w-24 py-1.5 ${p.stock < 20 ? "border-red-300 text-red-700" : ""}`}
                      aria-label={`${p.name} 재고`}
                    />
                    <button type="submit" className="btn-outline px-3 py-1.5 text-xs">
                      저장
                    </button>
                  </form>
                </td>
                <td className="px-4 py-2.5">
                  <form action={toggleActive.bind(null, p.id, !p.is_active)}>
                    <button
                      type="submit"
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        p.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {p.is_active ? "판매중" : "판매중지"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
