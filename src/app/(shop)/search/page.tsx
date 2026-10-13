import type { Metadata } from "next";
import { getProducts, parseSort } from "@/lib/data";
import { ProductGrid } from "@/components/product/ProductCard";
import SortTabs from "@/components/product/SortTabs";

export const metadata: Metadata = { title: "검색" };

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() ?? "";
  const sort = parseSort(params.sort);
  const products = q ? await getProducts({ query: q, sort }) : [];

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold">
        {q ? (
          <>
            <span className="text-brand-700">&lsquo;{q}&rsquo;</span> 검색 결과
          </>
        ) : (
          "검색어를 입력해 주세요"
        )}
      </h1>
      {q && (
        <>
          <div className="mt-6 flex items-center justify-between border-b border-line pb-3">
            <p className="text-sm text-muted">총 {products.length}개</p>
            <SortTabs current={sort} basePath="/search" extraParams={{ q }} />
          </div>
          <div className="mt-6">
            <ProductGrid products={products} />
          </div>
        </>
      )}
    </div>
  );
}
