import type { Metadata } from "next";
import PaymentResult from "@/components/checkout/PaymentResult";

export const metadata: Metadata = { title: "결제 확인" };

export default async function CheckoutSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const params = await searchParams;
  const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

  return (
    <div className="container-page py-16">
      <PaymentResult
        paymentKey={pick(params.paymentKey)}
        orderNo={pick(params.orderId)}
        amount={Number(pick(params.amount))}
      />
    </div>
  );
}
