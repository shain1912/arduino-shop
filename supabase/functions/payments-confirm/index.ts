// 토스페이먼츠 결제 승인 → 주문 확정(재고 차감)
// 호출: POST { paymentKey, orderId, amount }  (Authorization: 로그인 사용자 JWT)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// 운영 시에는 대시보드에서 TOSS_SECRET_KEY를 실제 키로 등록한다.
// 등록 전에는 토스페이먼츠 문서에 공개된 테스트 시크릿 키를 쓴다(실제 결제 안 됨).
const TOSS_SECRET_KEY =
  Deno.env.get("TOSS_SECRET_KEY") ?? "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R";
const TOSS_AUTH = "Basic " + btoa(TOSS_SECRET_KEY + ":");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function cancelTossPayment(paymentKey: string, reason: string) {
  await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, {
    method: "POST",
    headers: { Authorization: TOSS_AUTH, "Content-Type": "application/json" },
    body: JSON.stringify({ cancelReason: reason }),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ message: "Method not allowed" }, 405);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 1. 로그인 사용자 확인 (Auth 서버에 토큰 검증 요청)
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ message: "로그인이 필요합니다." }, 401);
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) return json({ message: "로그인이 필요합니다." }, 401);

  let body: { paymentKey?: string; orderId?: string; amount?: number };
  try {
    body = await req.json();
  } catch {
    return json({ message: "잘못된 요청입니다." }, 400);
  }
  const { paymentKey, orderId } = body;
  const amount = Number(body.amount);
  if (!paymentKey || !orderId || !Number.isInteger(amount)) {
    return json({ message: "결제 정보가 올바르지 않습니다." }, 400);
  }

  // 2. 주문 검증 (본인 주문, 금액 일치)
  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, status, total_amount")
    .eq("order_no", orderId)
    .maybeSingle();
  if (!order || order.user_id !== userData.user.id) {
    return json({ message: "주문을 찾을 수 없습니다." }, 404);
  }
  if (order.status !== "pending") {
    const { data: paid } = await admin
      .from("payments")
      .select("id")
      .eq("order_id", order.id)
      .eq("payment_key", paymentKey)
      .maybeSingle();
    if (paid) return json({ ok: true, orderId: order.id });
    return json({ message: "이미 처리된 주문입니다." }, 409);
  }
  if (order.total_amount !== amount) {
    return json({ message: "결제 금액이 주문 금액과 다릅니다." }, 400);
  }

  // 3. 토스페이먼츠 결제 승인
  const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: TOSS_AUTH,
      "Content-Type": "application/json",
      "Idempotency-Key": `confirm-${paymentKey}`,
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });
  const toss = await tossRes.json();
  if (!tossRes.ok) {
    return json({ message: toss.message ?? "결제 승인에 실패했습니다.", code: toss.code }, 400);
  }

  // 4. 주문 확정 (재고 차감 + 상태 변경). 실패하면 결제를 취소한다.
  const { error: finalizeError } = await admin.rpc("finalize_payment", {
    p_order_no: orderId,
    p_payment_key: paymentKey,
    p_method: toss.method ?? "",
    p_amount: amount,
    p_approved_at: toss.approvedAt ?? null,
    p_raw: toss,
  });
  if (finalizeError) {
    await cancelTossPayment(paymentKey, "주문 확정 실패로 자동 취소");
    await admin.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    const outOfStock = finalizeError.message.startsWith("OUT_OF_STOCK");
    return json(
      {
        message: outOfStock
          ? `재고가 부족해 결제를 취소했습니다. (${finalizeError.message.split(":")[1] ?? ""})`
          : "주문 처리 중 오류가 발생해 결제를 취소했습니다.",
      },
      409,
    );
  }

  return json({ ok: true, orderId: order.id });
});
