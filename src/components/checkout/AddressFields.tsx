"use client";

import { openPostcode } from "@/lib/payments/postcode";

export type AddressValue = {
  recipient: string;
  phone: string;
  zipcode: string;
  address1: string;
  address2: string;
};

export const EMPTY_ADDRESS: AddressValue = { recipient: "", phone: "", zipcode: "", address1: "", address2: "" };

export default function AddressFields({
  value,
  onChange,
}: {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
}) {
  const set = (patch: Partial<AddressValue>) => onChange({ ...value, ...patch });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="label" htmlFor="recipient">
          받는 분
        </label>
        <input
          id="recipient"
          className="input"
          value={value.recipient}
          onChange={(e) => set({ recipient: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="phone">
          연락처
        </label>
        <input
          id="phone"
          className="input"
          inputMode="tel"
          placeholder="010-0000-0000"
          value={value.phone}
          onChange={(e) => set({ phone: e.target.value })}
          required
        />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="zipcode">
          주소
        </label>
        <div className="flex gap-2">
          <input
            id="zipcode"
            className="input w-32"
            placeholder="우편번호"
            value={value.zipcode}
            onChange={(e) => set({ zipcode: e.target.value })}
            required
          />
          <button
            type="button"
            className="btn-outline shrink-0"
            onClick={() => openPostcode((zipcode, address1) => set({ zipcode, address1 })).catch(() => {})}
          >
            주소 검색
          </button>
        </div>
        <input
          className="input mt-2"
          placeholder="기본 주소"
          value={value.address1}
          onChange={(e) => set({ address1: e.target.value })}
          required
          aria-label="기본 주소"
        />
        <input
          className="input mt-2"
          placeholder="상세 주소 (동·호수)"
          value={value.address2}
          onChange={(e) => set({ address2: e.target.value })}
          aria-label="상세 주소"
        />
      </div>
    </div>
  );
}
