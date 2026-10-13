"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { confirmPayment, type ConfirmResult } from "@/lib/actions/orders";
import { useCart } from "@/stores/cart";
import { formatPrice } from "@/lib/utils/format";

export default function PaymentResult({
  paymentKey,
  orderNo,
  amount,
}: {
  paymentKey: string;
  orderNo: string;
  amount: number;
}) {
  const [result, setResult] = useState<ConfirmResult | null>(null);
  const started = useRef(false);
  const clear = useCart((s) => s.clear);
  const invalid = !paymentKey || !orderNo || !Number.isInteger(amount);

  useEffect(() => {
    if (started.current || invalid) return;
    started.current = true;
    confirmPayment(paymentKey, orderNo, amount).then((r) => {
      setResult(r);
      if (r.ok) clear();
    });
  }, [paymentKey, orderNo, amount, clear, invalid]);

  if (invalid) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-xl font-bold">잘못된 접근입니다</h1>
        <p className="mt-2 text-sm text-muted">결제 정보가 올바르지 않습니다.</p>
        <Link href="/" className="btn-primary mt-8">
          홈으로
        </Link>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500" />
        <p className="mt-5 font-semibold">결제를 확인하고 있습니다...</p>
        <p className="mt-1 text-sm text-muted">창을 닫지 말고 잠시만 기다려 주세요.</p>
      </div>
    );
  }

  if (!result.ok) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-4xl">⚠️</p>
        <h1 className="mt-4 text-xl font-bold">결제를 완료하지 못했습니다</h1>
        <p className="mt-2 text-sm text-muted">{result.error}</p>
        <div className="mt-8 flex justify-center gap-2">
          <Link href="/cart" className="btn-outline">
            장바구니로
          </Link>
          <Link href="/mypage" className="btn-dark">
            주문 내역 보기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-2xl text-white">
        ✓
      </div>
      <h1 className="mt-5 text-2xl font-bold">주문이 완료되었습니다</h1>
      <dl className="mt-6 space-y-2 rounded-xl bg-surface p-5 text-left text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">주문번호</dt>
          <dd className="font-mono font-semibold">{orderNo}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">결제금액</dt>
          <dd className="font-semibold">{formatPrice(amount)}</dd>
        </div>
      </dl>
      <div className="mt-8 flex justify-center gap-2">
        <Link href="/products" className="btn-outline">
          쇼핑 계속하기
        </Link>
        <Link href={`/mypage/orders/${result.orderId}`} className="btn-primary">
          주문 상세 보기
        </Link>
      </div>
    </div>
  );
}
