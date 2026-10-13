"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export type ReviewFormState = { error?: string; ok?: boolean };

export async function addReview(
  productId: number,
  productSlug: string,
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "로그인 후 리뷰를 작성할 수 있습니다." };

  const rating = Number(formData.get("rating"));
  const content = String(formData.get("content") ?? "").trim();
  if (!(rating >= 1 && rating <= 5)) return { error: "별점을 선택해 주세요." };
  if (content.length < 5) return { error: "리뷰는 5자 이상 입력해 주세요." };
  if (content.length > 1000) return { error: "리뷰는 1,000자 이내로 입력해 주세요." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .insert({ product_id: productId, user_id: user.id, rating, content });
  if (error) return { error: "리뷰 저장에 실패했습니다." };

  revalidatePath(`/products/${productSlug}`);
  return { ok: true };
}

export async function deleteReview(reviewId: number, productSlug: string) {
  const supabase = await createClient();
  await supabase.from("reviews").delete().eq("id", reviewId);
  revalidatePath(`/products/${productSlug}`);
}
