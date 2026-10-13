import type { Metadata } from "next";
import { getProducts, parseSort } from "@/lib/data";
import { ProductGrid } from "@/components/product/ProductCard";
import SortTabs from "@/components/product/SortTabs";

export const metadata: Metadata = { title: "전체상품" };

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const sort = parseSort((await searchParams).sort);
  const products = await getProducts({ sort });

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold">전체상품</h1>
      <div className="mt-6 flex items-center justify-between border-b border-line pb-3">
        <p className="text-sm text-muted">총 {products.length}개</p>
        <SortTabs current={sort} basePath="/products" />
      </div>
      <div className="mt-6">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
