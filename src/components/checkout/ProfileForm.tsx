"use client";

import { useActionState } from "react";
import { updateProfile, type FormState } from "@/lib/actions/account";

export default function ProfileForm({ email, name, phone }: { email: string; name: string; phone: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateProfile, {});

  return (
    <form action={formAction} className="card mt-6 max-w-lg space-y-4 p-5">
      <div>
        <label className="label" htmlFor="email">
          이메일
        </label>
        <input id="email" className="input bg-surface text-muted" value={email} disabled />
      </div>
      <div>
        <label className="label" htmlFor="name">
          이름
        </label>
        <input id="name" name="name" className="input" defaultValue={name} required />
      </div>
      <div>
        <label className="label" htmlFor="phone">
          연락처
        </label>
        <input id="phone" name="phone" className="input" inputMode="tel" defaultValue={phone} placeholder="010-0000-0000" />
      </div>
      <div className="flex items-center justify-between">
        <p className={`text-sm ${state.error ? "text-red-600" : "text-brand-700"}`}>
          {state.error ?? (state.ok ? "저장했습니다." : "")}
        </p>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}
