import Link from "next/link";
import Image from "next/image";
import { getCategories, getProducts } from "@/lib/data";
import { ProductGrid } from "@/components/product/ProductCard";

export default async function HomePage() {
  const [categories, featured, latest] = await Promise.all([
    getCategories(),
    getProducts({ featured: true, limit: 8 }),
    getProducts({ sort: "new", limit: 8 }),
  ]);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-brand-900">
        <Image
          src="/images/hero-1.jpg"
          alt="브레드보드에 아두이노와 부품을 연결한 작업대"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover opacity-45"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-900 via-brand-900/80 to-transparent" />
        <div className="container-page py-20 sm:py-28">
          <p className="text-sm font-semibold tracking-wide text-brand-100">ARDUINO · SENSOR · MODULE</p>
          <h1 className="mt-3 max-w-xl text-3xl leading-tight font-extrabold text-white sm:text-5xl">
            아이디어를 회로로,
            <br />
            메이커볼트에서 시작하세요
          </h1>
          <p className="mt-4 max-w-lg text-base text-brand-100/90">
            아두이노 정품 보드부터 센서, 모터, 디스플레이, 입문 키트까지 프로젝트에 필요한 부품을 한곳에서.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="btn-primary px-6 py-3">
              전체 상품 보기
            </Link>
            <Link href="/categories/kits" className="btn border border-white/40 px-6 py-3 text-white hover:bg-white/10">
              입문 키트 보기
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page mt-14">
        <h2 className="text-xl font-bold">카테고리</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="group overflow-hidden rounded-xl border border-line bg-white transition hover:border-brand-500"
            >
              <div className="relative aspect-[4/3] bg-surface">
                {c.image && (
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(min-width: 1024px) 180px, 45vw"
                    className="object-cover transition group-hover:scale-105"
                  />
                )}
              </div>
              <p className="px-3 py-2.5 text-sm font-semibold group-hover:text-brand-700">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page mt-16">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold">추천 상품</h2>
          <Link href="/products" className="text-sm text-muted hover:text-brand-700">
            전체보기 →
          </Link>
        </div>
        <div className="mt-5">
          <ProductGrid products={featured} />
        </div>
      </section>

      <section className="container-page mt-16">
        <div className="relative isolate overflow-hidden rounded-2xl bg-ink">
          <Image
            src="/images/hero-2.jpg"
            alt="전자부품 프로젝트 작업 모습"
            fill
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="-z-10 object-cover opacity-40"
          />
          <div className="px-6 py-12 sm:px-12">
            <p className="text-sm font-semibold text-brand-100">처음 시작한다면</p>
            <p className="mt-2 text-2xl font-bold text-white">스타터 키트 하나로 LED부터 센서까지</p>
            <p className="mt-2 text-sm text-white/80">
              브레드보드, 점퍼 와이어, 기본 부품이 함께 들어 있어 바로 실습할 수 있습니다.
            </p>
            <Link href="/categories/kits" className="btn-primary mt-6">
              키트 둘러보기
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page mt-16">
        <h2 className="text-xl font-bold">새로 들어온 상품</h2>
        <div className="mt-5">
          <ProductGrid products={latest} />
        </div>
      </section>
    </>
  );
}
