"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { friendlyOrderError } from "@/lib/utils/format";

export type CheckoutInput = {
  items: { productId: number; quantity: number }[];
  recipient: string;
  phone: string;
  zipcode: string;
  address1: string;
  address2: string;
  memo: string;
  saveAddress: boolean;
};

export type CreateOrderResult =
  | { ok: true; orderNo: string; orderName: string; amount: number; customerKey: string; email: string; name: string }
  | { ok: false; error: string };

export async function createOrder(input: CheckoutInput): Promise<CreateOrderResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "로그인이 필요합니다." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_order", {
    p_items: input.items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
    p_recipient: input.recipient,
    p_phone: input.phone,
    p_zipcode: input.zipcode,
    p_address1: input.address1,
    p_address2: input.address2,
    p_memo: input.memo,
  });
  if (error || !data?.[0]) {
    return { ok: false, error: friendlyOrderError(error?.message ?? "") };
  }

  if (input.saveAddress) {
    const { count } = await supabase
      .from("addresses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    await supabase.from("addresses").insert({
      user_id: user.id,
      label: "기본 배송지",
      recipient: input.recipient.trim(),
      phone: input.phone.trim(),
      zipcode: input.zipcode.trim(),
      address1: input.address1.trim(),
      address2: input.address2.trim(),
      is_default: !count,
    });
  }

  const order = data[0];
  return {
    ok: true,
    orderNo: order.order_no,
    orderName: order.order_name,
    amount: order.total_amount,
    customerKey: user.id,
    email: user.email,
    name: user.name,
  };
}

export type ConfirmResult = { ok: true; orderId: string } | { ok: false; error: string };

// 토스 결제 성공 리다이렉트 후 호출. 실제 승인·재고 차감은 Edge Function이 처리한다.
export async function confirmPayment(paymentKey: string, orderNo: string, amount: number): Promise<ConfirmResult> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false, error: "로그인이 필요합니다." };

  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/payments-confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ paymentKey, orderId: orderNo, amount }),
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.ok) {
    return { ok: false, error: body.message ?? "결제 승인에 실패했습니다." };
  }
  return { ok: true, orderId: body.orderId };
}

export async function cancelPendingOrder(orderId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_pending_order", { p_order_id: orderId });
  revalidatePath("/mypage");
  revalidatePath(`/mypage/orders/${orderId}`);
  return { ok: !error };
}

export async function cancelPendingOrderByNo(orderNo: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("id, status").eq("order_no", orderNo).maybeSingle();
  if (data?.status === "pending") {
    await supabase.rpc("cancel_pending_order", { p_order_id: data.id });
  }
}
