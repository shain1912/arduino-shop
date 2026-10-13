import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: { default: "관리자", template: "%s | 관리자" } };

const NAV = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/orders", label: "주문 관리" },
  { href: "/admin/products", label: "상품 관리" },
  { href: "/admin/inventory", label: "재고 관리" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();

  return (
    <div className="container-page py-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="lg:w-48 lg:shrink-0">
          <p className="rounded-lg bg-ink px-4 py-3 text-sm font-bold text-white">관리자</p>
          <nav className="mt-3 flex gap-1 overflow-x-auto lg:flex-col">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="shrink-0 rounded-lg px-3 py-2 text-sm hover:bg-surface hover:text-brand-700"
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
