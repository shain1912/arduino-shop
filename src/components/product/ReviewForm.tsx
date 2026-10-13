"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addReview, type ReviewFormState } from "@/lib/actions/reviews";

export default function ReviewForm({ productId, productSlug }: { productId: number; productSlug: string }) {
  const [state, formAction, pending] = useActionState<ReviewFormState, FormData>(
    addReview.bind(null, productId, productSlug),
    {},
  );
  const [rating, setRating] = useState(5);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="card space-y-3 p-4">
      <div className="flex items-center gap-1" role="radiogroup" aria-label="별점">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`text-2xl leading-none ${n <= rating ? "text-amber-500" : "text-line"}`}
            aria-label={`${n}점`}
            aria-pressed={n === rating}
          >
            ★
          </button>
        ))}
        <input type="hidden" name="rating" value={rating} />
      </div>
      <textarea
        name="content"
        rows={3}
        maxLength={1000}
        placeholder="상품을 사용해 본 경험을 남겨 주세요. (5자 이상)"
        className="input resize-none"
        required
      />
      <div className="flex items-center justify-between">
        <p className={`text-sm ${state.error ? "text-red-600" : "text-brand-700"}`}>
          {state.error ?? (state.ok ? "리뷰가 등록되었습니다." : "")}
        </p>
        <button type="submit" className="btn-dark" disabled={pending}>
          {pending ? "등록 중..." : "리뷰 등록"}
        </button>
      </div>
    </form>
  );
}
