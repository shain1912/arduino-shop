"use client";

import { loadTossPayments } from "@tosspayments/tosspayments-sdk";

export async function requestTossPayment(params: {
  customerKey: string;
  orderNo: string;
  orderName: string;
  amount: number;
  email: string;
  name: string;
}) {
  const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!);
  const payment = tossPayments.payment({ customerKey: params.customerKey });
  const origin = window.location.origin;

  // 성공·실패 시 해당 URL로 이동한다 (리다이렉트 방식)
  await payment.requestPayment({
    method: "CARD",
    amount: { currency: "KRW", value: params.amount },
    orderId: params.orderNo,
    orderName: params.orderName.slice(0, 100),
    successUrl: `${origin}/checkout/success`,
    failUrl: `${origin}/checkout/fail`,
    customerEmail: params.email || undefined,
    customerName: params.name || undefined,
    card: {
      useEscrow: false,
      flowMode: "DEFAULT",
      useCardPoint: false,
      useAppCardOnly: false,
    },
  });
}
