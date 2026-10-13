import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/data";
import { deleteProduct } from "@/lib/actions/admin";
import ProductForm from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "상품 수정" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const supabase = await createClient();
  const [{ data: product }, categories] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    getCategories(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">상품 수정</h1>
        <form action={deleteProduct.bind(null, product.id)}>
          <button type="submit" className="btn-outline text-red-600 hover:border-red-500 hover:text-red-700">
            상품 삭제
          </button>
        </form>
      </div>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
