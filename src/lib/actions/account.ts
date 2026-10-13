"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export type FormState = { error?: string; ok?: boolean };

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "로그인이 필요합니다." };
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!name) return { error: "이름을 입력해 주세요." };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ name, phone }).eq("id", user.id);
  if (error) return { error: "저장에 실패했습니다." };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function addAddress(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "로그인이 필요합니다." };
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const address = {
    label: get("label"),
    recipient: get("recipient"),
    phone: get("phone"),
    zipcode: get("zipcode"),
    address1: get("address1"),
    address2: get("address2"),
  };
  if (!address.recipient || !address.phone || !address.zipcode || !address.address1) {
    return { error: "받는 분, 연락처, 주소를 모두 입력해 주세요." };
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  const makeDefault = formData.get("is_default") === "on" || !count;
  if (makeDefault) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  }
  const { error } = await supabase
    .from("addresses")
    .insert({ ...address, user_id: user.id, is_default: makeDefault });
  if (error) return { error: "저장에 실패했습니다." };
  revalidatePath("/mypage/addresses");
  return { ok: true };
}

export async function deleteAddress(id: number) {
  const supabase = await createClient();
  await supabase.from("addresses").delete().eq("id", id);
  revalidatePath("/mypage/addresses");
}

export async function setDefaultAddress(id: number) {
  const user = await getCurrentUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  await supabase.from("addresses").update({ is_default: true }).eq("id", id);
  revalidatePath("/mypage/addresses");
}
