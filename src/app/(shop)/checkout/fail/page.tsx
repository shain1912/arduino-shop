import type { Metadata } from "next";
import Link from "next/link";
import { cancelPendingOrderByNo } from "@/lib/actions/orders";
import CancelOnMount from "@/components/checkout/CancelOnMount";

export const metadata: Metadata = { title: "결제 실패" };

export default async function CheckoutFailPage({ searchParams }: PageProps<"/checkout/fail">) {
  const params = await searchParams;
  const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const code = pick(params.code);
  const message = pick(params.message);
  const orderNo = pick(params.orderId);
  const userCancelled = code === "PAY_PROCESS_CANCELED";

  return (
    <div className="container-page py-16">
      {orderNo && <CancelOnMount action={cancelPendingOrderByNo.bind(null, orderNo)} />}
      <div className="mx-auto max-w-md text-center">
        <p className="text-4xl">{userCancelled ? "🛒" : "⚠️"}</p>
        <h1 className="mt-4 text-xl font-bold">
          {userCancelled ? "결제를 취소했습니다" : "결제에 실패했습니다"}
        </h1>
        {message && <p className="mt-2 text-sm text-muted">{message}</p>}
        {code && !userCancelled && <p className="mt-1 text-xs text-muted">오류 코드: {code}</p>}
        <p className="mt-4 text-sm text-muted">장바구니에 담긴 상품은 그대로 남아 있습니다.</p>
        <div className="mt-8 flex justify-center gap-2">
          <Link href="/cart" className="btn-outline">
            장바구니로
          </Link>
          <Link href="/checkout" className="btn-primary">
            다시 결제하기
          </Link>
        </div>
      </div>
    </div>
  );
}
