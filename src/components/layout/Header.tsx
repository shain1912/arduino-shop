import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/lib/data";
import { signOut } from "@/lib/actions/auth";
import CartButton from "./CartButton";
import SearchForm from "./SearchForm";

export default async function Header() {
  const [user, categories] = await Promise.all([getCurrentUser(), getCategories()]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="bg-brand-900 text-xs text-brand-100">
        <div className="container-page flex h-8 items-center justify-between">
          <span>30,000원 이상 구매 시 무료배송 · 평일 오후 3시 이전 주문 당일 출고</span>
          <nav className="hidden items-center gap-4 sm:flex">
            {user ? (
              <>
                {user.isAdmin && (
                  <Link href="/admin" className="font-semibold text-white hover:underline">
                    관리자
                  </Link>
                )}
                <Link href="/mypage" className="hover:text-white">
                  {user.name || user.email}님
                </Link>
                <form action={signOut}>
                  <button type="submit" className="hover:text-white">
                    로그아웃
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-white">
                  로그인
                </Link>
                <Link href="/signup" className="hover:text-white">
                  회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="container-page flex h-16 items-center gap-4 sm:gap-8">
        <Link href="/" className="flex shrink-0 items-baseline gap-1.5">
          <span className="text-xl font-extrabold tracking-tight text-brand-600">MakerVolt</span>
          <span className="hidden text-sm font-semibold text-ink sm:inline">메이커볼트</span>
        </Link>
        <SearchForm />
        <div className="flex items-center gap-1">
          <Link
            href={user ? "/mypage" : "/login"}
            className="rounded-lg px-2.5 py-2 text-sm font-medium text-ink hover:bg-surface sm:hidden"
          >
            {user ? "MY" : "로그인"}
          </Link>
          <CartButton />
        </div>
      </div>

      <nav className="container-page -mb-px flex gap-1 overflow-x-auto text-sm">
        <Link
          href="/products"
          className="shrink-0 border-b-2 border-transparent px-3 py-2.5 font-medium text-ink hover:border-brand-500 hover:text-brand-700"
        >
          전체상품
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/categories/${c.slug}`}
            className="shrink-0 border-b-2 border-transparent px-3 py-2.5 text-muted hover:border-brand-500 hover:text-brand-700"
          >
            {c.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}
