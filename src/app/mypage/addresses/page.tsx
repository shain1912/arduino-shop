import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { deleteAddress, setDefaultAddress } from "@/lib/actions/account";
import AddressForm from "@/components/checkout/AddressForm";

export const metadata: Metadata = { title: "배송지 관리" };

export default async function AddressesPage() {
  const user = await requireUser("/mypage/addresses");
  const supabase = await createClient();
  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-bold">배송지 관리</h1>

      {addresses && addresses.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {addresses.map((a) => (
            <li key={a.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm">
                <p className="font-semibold">
                  {a.label || a.recipient}
                  {a.is_default && (
                    <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">기본</span>
                  )}
                </p>
                <p className="mt-1">
                  {a.recipient} · {a.phone}
                </p>
                <p className="text-muted">
                  ({a.zipcode}) {a.address1} {a.address2}
                </p>
              </div>
              <div className="flex gap-2">
                {!a.is_default && (
                  <form action={setDefaultAddress.bind(null, a.id)}>
                    <button type="submit" className="btn-outline px-3 py-1.5 text-xs">
                      기본으로
                    </button>
                  </form>
                )}
                <form action={deleteAddress.bind(null, a.id)}>
                  <button type="submit" className="btn-outline px-3 py-1.5 text-xs hover:border-red-500 hover:text-red-600">
                    삭제
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-xl border border-dashed border-line py-10 text-center text-sm text-muted">
          저장된 배송지가 없습니다.
        </p>
      )}

      <h2 className="mt-10 font-bold">새 배송지 추가</h2>
      <AddressForm />
    </div>
  );
}
