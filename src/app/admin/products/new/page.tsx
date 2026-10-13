import type { Metadata } from "next";
import { getCategories } from "@/lib/data";
import ProductForm from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "상품 등록" };

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <div>
      <h1 className="text-xl font-bold">상품 등록</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
