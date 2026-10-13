import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "상품 관리" };

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, price, stock, image, is_active, is_featured, categories(name)")
    .order("category_id")
    .order("id");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">상품 관리</h1>
        <Link href="/admin/products/new" className="btn-primary">
          + 상품 등록
        </Link>
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-surface text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">상품</th>
              <th className="px-4 py-3 font-medium">카테고리</th>
              <th className="px-4 py-3 text-right font-medium">가격</th>
              <th className="px-4 py-3 text-right font-medium">재고</th>
              <th className="px-4 py-3 font-medium">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(products ?? []).map((p) => (
              <tr key={p.id} className="hover:bg-surface">
                <td className="px-4 py-2.5">
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 hover:text-brand-700">
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-line bg-white">
                      {p.image && <Image src={p.image} alt="" fill sizes="40px" className="object-contain" />}
                    </span>
                    <span className="line-clamp-1 font-medium">{p.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-muted">{p.categories?.name}</td>
                <td className="px-4 py-2.5 text-right">{formatPrice(p.price)}</td>
                <td className={`px-4 py-2.5 text-right ${p.stock < 20 ? "font-semibold text-red-600" : ""}`}>{p.stock}</td>
                <td className="px-4 py-2.5 text-xs">
                  {p.is_active ? (
                    <span className="text-emerald-700">판매중</span>
                  ) : (
                    <span className="text-muted">판매중지</span>
                  )}
                  {p.is_featured && <span className="ml-1.5 text-brand-700">· 추천</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
