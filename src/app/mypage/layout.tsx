import Link from "next/link";
import { requireUser } from "@/lib/auth";

const NAV = [
  { href: "/mypage", label: "주문 내역" },
  { href: "/mypage/addresses", label: "배송지 관리" },
  { href: "/mypage/profile", label: "회원 정보" },
];

export default async function MypageLayout({ children }: LayoutProps<"/mypage">) {
  const user = await requireUser("/mypage");

  return (
    <div className="container-page py-10">
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="md:w-52 md:shrink-0">
          <div className="rounded-xl bg-brand-900 p-5 text-white">
            <p className="text-sm text-brand-100">반갑습니다</p>
            <p className="mt-1 text-lg font-bold">{user.name || "회원"}님</p>
            <p className="mt-0.5 truncate text-xs text-brand-100">{user.email}</p>
          </div>
          <nav className="mt-4 flex gap-1 overflow-x-auto md:flex-col">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="shrink-0 rounded-lg px-3 py-2 text-sm text-ink hover:bg-surface hover:text-brand-700"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
