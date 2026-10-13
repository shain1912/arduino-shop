import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = { title: "주문서 작성" };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const supabase = await createClient();
  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold">주문서 작성</h1>
      <CheckoutForm addresses={addresses ?? []} defaultName={user.name} defaultPhone={user.phone} />
    </div>
  );
}
