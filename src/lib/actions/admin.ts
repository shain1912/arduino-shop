"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { ORDER_STATUS } from "@/lib/utils/format";
import type { Json } from "@/types/database";

async function assertAdmin() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) throw new Error("관리자만 사용할 수 있습니다.");
}

export type ProductFormState = { error?: string };

function parseSpecs(text: string): Record<string, string> {
  // "키: 값" 한 줄에 하나
  const specs: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const idx = line.indexOf(":");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key && value) specs[key] = value;
  }
  return specs;
}

export async function saveProduct(
  productId: number | null,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await assertAdmin();
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  const slug = get("slug").toLowerCase();
  const price = Number(get("price"));
  const stock = Number(get("stock"));
  const categoryId = Number(get("category_id"));
  if (!get("name")) return { error: "상품명을 입력해 주세요." };
  if (!/^[a-z0-9-]+$/.test(slug)) return { error: "주소용 이름(slug)은 영문 소문자, 숫자, 하이픈만 쓸 수 있습니다." };
  if (!Number.isInteger(price) || price < 0) return { error: "가격을 올바르게 입력해 주세요." };
  if (!Number.isInteger(stock) || stock < 0) return { error: "재고를 올바르게 입력해 주세요." };
  if (!categoryId) return { error: "카테고리를 선택해 주세요." };

  const values = {
    name: get("name"),
    slug,
    brand: get("brand"),
    summary: get("summary"),
    description: get("description"),
    price,
    stock,
    category_id: categoryId,
    image: get("image"),
    source_url: get("source_url"),
    specs: parseSpecs(String(formData.get("specs") ?? "")) as Json,
    is_featured: formData.get("is_featured") === "on",
    is_active: formData.get("is_active") === "on",
  };

  const supabase = await createClient();
  const { error } = productId
    ? await supabase.from("products").update(values).eq("id", productId)
    : await supabase.from("products").insert(values);
  if (error) {
    if (error.code === "23505") return { error: "같은 slug를 쓰는 상품이 이미 있습니다." };
    return { error: `저장에 실패했습니다. (${error.message})` };
  }

  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function deleteProduct(productId: number) {
  await assertAdmin();
  const supabase = await createClient();
  // 주문 이력이 있는 상품도 지울 수 있도록 order_items.product_id는 null 처리된다 (on delete set null)
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) {
    // 리뷰 등 참조가 남아 있으면 판매 중지로 대신한다
    await supabase.from("products").update({ is_active: false }).eq("id", productId);
  }
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function updateStock(productId: number, formData: FormData) {
  await assertAdmin();
  const stock = Number(formData.get("stock"));
  if (!Number.isInteger(stock) || stock < 0) return;
  const supabase = await createClient();
  await supabase.from("products").update({ stock }).eq("id", productId);
  revalidatePath("/admin/inventory");
  revalidatePath("/", "layout");
}

export async function toggleActive(productId: number, active: boolean) {
  await assertAdmin();
  const supabase = await createClient();
  await supabase.from("products").update({ is_active: active }).eq("id", productId);
  revalidatePath("/admin/inventory");
  revalidatePath("/", "layout");
}

export async function updateOrderStatus(orderId: string, formData: FormData) {
  await assertAdmin();
  const status = String(formData.get("status"));
  if (!(status in ORDER_STATUS)) return;
  const supabase = await createClient();
  await supabase.from("orders").update({ status }).eq("id", orderId);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
