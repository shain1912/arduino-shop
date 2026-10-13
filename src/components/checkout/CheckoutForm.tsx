"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Tables } from "@/types/database";
import { cartTotals, useCart } from "@/stores/cart";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCartSync } from "@/hooks/use-cart-sync";
import { cancelPendingOrderByNo, createOrder } from "@/lib/actions/orders";
import { requestTossPayment } from "@/lib/payments/toss";
import { formatPrice, shippingFeeFor } from "@/lib/utils/format";
import AddressFields, { EMPTY_ADDRESS, type AddressValue } from "./AddressFields";

const MEMO_PRESETS = ["문 앞에 놓아 주세요", "경비실에 맡겨 주세요", "배송 전 연락 부탁드립니다"];

export default function CheckoutForm({
  addresses,
  defaultName,
  defaultPhone,
}: {
  addresses: Tables<"addresses">[];
  defaultName: string;
  defaultPhone: string;
}) {
  const hydrated = useHydrated();
  const { synced, removedCount } = useCartSync();
  const items = useCart((s) => s.items);
  const { amount } = cartTotals(items);
  const shipping = shippingFeeFor(amount);

  const initial = addresses[0];
  const [address, setAddress] = useState<AddressValue>(
    initial
      ? {
          recipient: initial.recipient,
          phone: initial.phone,
          zipcode: initial.zipcode,
          address1: initial.address1,
          address2: initial.address2,
        }
      : { ...EMPTY_ADDRESS, recipient: defaultName, phone: defaultPhone },
  );
  const [memoPreset, setMemoPreset] = useState("");
  const [customMemo, setCustomMemo] = useState("");
  const memo = memoPreset === "custom" ? customMemo : memoPreset;
  const [saveAddress, setSaveAddress] = useState(addresses.length === 0);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!hydrated || !synced) {
    return <div className="mt-8 h-64 animate-pulse rounded-xl bg-surface" />;
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-line py-20 text-center">
        <p className="text-muted">주문할 상품이 없습니다.</p>
        <Link href="/products" className="btn-primary mt-5">
          상품 보러 가기
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!agreed) {
      setError("주문 내용 확인 및 결제 진행에 동의해 주세요.");
      return;
    }
    setSubmitting(true);
    const result = await createOrder({
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      ...address,
      memo,
      saveAddress,
    });
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    try {
      await requestTossPayment({
        customerKey: result.customerKey,
        orderNo: result.orderNo,
        orderName: result.orderName,
        amount: result.amount,
        email: result.email,
        name: result.name || address.recipient,
      });
    } catch (err) {
      // 사용자가 결제창을 닫은 경우 등: 만들어 둔 결제 대기 주문을 정리한다
      await cancelPendingOrderByNo(result.orderNo).catch(() => {});
      const message = err instanceof Error ? err.message : "";
      setError(message ? `결제가 진행되지 않았습니다. (${message})` : "결제가 진행되지 않았습니다.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-8">
        {removedCount > 0 && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            판매가 종료되었거나 품절된 상품 {removedCount}개가 주문에서 빠졌습니다.
          </p>
        )}

        <section>
          <h2 className="border-b border-ink pb-3 font-bold">배송지</h2>
          {addresses.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {addresses.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() =>
                    setAddress({
                      recipient: a.recipient,
                      phone: a.phone,
                      zipcode: a.zipcode,
                      address1: a.address1,
                      address2: a.address2,
                    })
                  }
                  className="rounded-full border border-line px-3 py-1.5 text-xs hover:border-brand-500 hover:text-brand-700"
                >
                  {a.label || a.recipient} {a.is_default && "(기본)"}
                </button>
              ))}
            </div>
          )}
          <div className="mt-4">
            <AddressFields value={address} onChange={setAddress} />
          </div>
          <div className="mt-4">
            <label className="label" htmlFor="memo">
              배송 메모
            </label>
            <select
              id="memo"
              className="input"
              value={memoPreset}
              onChange={(e) => setMemoPreset(e.target.value)}
            >
              <option value="">선택 안 함</option>
              {MEMO_PRESETS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
              <option value="custom">직접 입력</option>
            </select>
            {memoPreset === "custom" && (
              <input
                className="input mt-2"
                maxLength={100}
                value={customMemo}
                onChange={(e) => setCustomMemo(e.target.value)}
                placeholder="배송 메모를 입력해 주세요"
                aria-label="배송 메모 직접 입력"
              />
            )}
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
            이 배송지를 내 배송지 목록에 저장
          </label>
        </section>

        <section>
          <h2 className="border-b border-ink pb-3 font-bold">주문 상품 {items.length}종</h2>
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center gap-4 py-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-white">
                  {item.image && (
                    <Image src={item.image} alt={item.name} fill sizes="64px" className="object-contain p-1" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted">
                    {formatPrice(item.price)} × {item.quantity}개
                  </p>
                </div>
                <p className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="h-fit rounded-xl bg-surface p-5 lg:sticky lg:top-36">
        <h2 className="font-bold">결제 금액</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">상품 금액</dt>
            <dd>{formatPrice(amount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">배송비</dt>
            <dd>{shipping === 0 ? "무료" : formatPrice(shipping)}</dd>
          </div>
        </dl>
        <div className="mt-4 flex justify-between border-t border-line pt-4">
          <span className="font-semibold">총 결제금액</span>
          <span className="text-xl font-extrabold text-brand-700">{formatPrice(amount + shipping)}</span>
        </div>
        <p className="mt-4 rounded-lg bg-white px-3 py-2 text-xs text-muted">
          결제수단: 신용·체크카드 (토스페이먼츠)
          <br />
          테스트 모드라 실제로 결제되지 않습니다.
        </p>
        <label className="mt-4 flex items-start gap-2 text-xs">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
          주문 내용을 확인했으며 결제 진행에 동의합니다.
        </label>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button type="submit" className="btn-primary mt-4 w-full py-3.5" disabled={submitting}>
          {submitting ? "결제 준비 중..." : `${formatPrice(amount + shipping)} 결제하기`}
        </button>
      </aside>
    </form>
  );
}
