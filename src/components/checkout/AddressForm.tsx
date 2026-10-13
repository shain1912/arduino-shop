"use client";

import { useActionState, useState } from "react";
import { addAddress, type FormState } from "@/lib/actions/account";
import AddressFields, { EMPTY_ADDRESS, type AddressValue } from "./AddressFields";

export default function AddressForm() {
  const [address, setAddress] = useState<AddressValue>(EMPTY_ADDRESS);
  const [label, setLabel] = useState("");
  const [state, formAction, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    const result = await addAddress(prev, formData);
    if (result.ok) {
      setAddress(EMPTY_ADDRESS);
      setLabel("");
    }
    return result;
  }, {});

  return (
    <form action={formAction} className="card mt-4 space-y-4 p-5">
      <div>
        <label className="label" htmlFor="label">
          배송지 이름
        </label>
        <input
          id="label"
          name="label"
          className="input"
          placeholder="예: 집, 회사"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>
      <AddressFields value={address} onChange={setAddress} />
      {Object.entries(address).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_default" />
        기본 배송지로 설정
      </label>
      <div className="flex items-center justify-between">
        <p className={`text-sm ${state.error ? "text-red-600" : "text-brand-700"}`}>
          {state.error ?? (state.ok ? "배송지를 저장했습니다." : "")}
        </p>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "저장 중..." : "배송지 저장"}
        </button>
      </div>
    </form>
  );
}
