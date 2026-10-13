import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProducts, parseSort } from "@/lib/data";
import { ProductGrid } from "@/components/product/ProductCard";
import SortTabs from "@/components/product/SortTabs";

export async function generateMetadata({ params }: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).slug);
  return { title: category?.name ?? "카테고리" };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/categories/[slug]">) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const sort = parseSort(query.sort);
  const products = await getProducts({ categoryId: category.id, sort });

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold">{category.name}</h1>
      {category.description && <p className="mt-2 text-sm text-muted">{category.description}</p>}
      <div className="mt-6 flex items-center justify-between border-b border-line pb-3">
        <p className="text-sm text-muted">총 {products.length}개</p>
        <SortTabs current={sort} basePath={`/categories/${slug}`} />
      </div>
      <div className="mt-6">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
