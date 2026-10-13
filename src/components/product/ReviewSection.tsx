import Link from "next/link";
import type { Tables } from "@/types/database";
import type { CurrentUser } from "@/lib/auth";
import { deleteReview } from "@/lib/actions/reviews";
import { formatDate } from "@/lib/utils/format";
import ReviewForm from "./ReviewForm";

export default function ReviewSection({
  productId,
  productSlug,
  reviews,
  user,
}: {
  productId: number;
  productSlug: string;
  reviews: Tables<"reviews">[];
  user: CurrentUser | null;
}) {
  return (
    <section className="mt-14">
      <h2 className="border-b-2 border-ink pb-3 text-lg font-bold">리뷰 {reviews.length}</h2>

      <div className="mt-5">
        {user ? (
          <ReviewForm productId={productId} productSlug={productSlug} />
        ) : (
          <p className="rounded-lg bg-surface px-4 py-3 text-sm text-muted">
            리뷰를 작성하려면{" "}
            <Link href={`/login?next=/products/${productSlug}`} className="font-semibold text-brand-700 underline">
              로그인
            </Link>
            해 주세요.
          </p>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">아직 작성된 리뷰가 없습니다.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {reviews.map((r) => (
            <li key={r.id} className="py-4">
              <div className="flex items-center justify-between text-sm">
                <p>
                  <span className="tracking-tight text-amber-500">
                    {"★".repeat(r.rating)}
                    <span className="text-line">{"★".repeat(5 - r.rating)}</span>
                  </span>
                  <span className="ml-2 font-medium">{r.author_name}</span>
                  <span className="ml-2 text-muted">{formatDate(r.created_at)}</span>
                </p>
                {user && (user.id === r.user_id || user.isAdmin) && (
                  <form action={deleteReview.bind(null, r.id, productSlug)}>
                    <button type="submit" className="text-xs text-muted hover:text-red-600">
                      삭제
                    </button>
                  </form>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">{r.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
