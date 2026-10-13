import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, getReviews } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice, shippingFeeFor, specsToEntries, FREE_SHIPPING_THRESHOLD } from "@/lib/utils/format";
import { ProductGrid, ProductImage } from "@/components/product/ProductCard";
import AddToCart from "@/components/product/AddToCart";
import ReviewSection from "@/components/product/ReviewSection";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "상품 없음" };
  return { title: product.name, description: product.summary };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, reviews, user] = await Promise.all([
    getRelatedProducts(product.category_id, product.id),
    getReviews(product.id),
    getCurrentUser(),
  ]);
  const specs = specsToEntries(product.specs);
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="container-page py-8">
      <nav className="text-sm text-muted">
        <Link href="/" className="hover:text-ink">
          홈
        </Link>
        {product.categories && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/categories/${product.categories.slug}`} className="hover:text-ink">
              {product.categories.name}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-5 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-white">
          <ProductImage src={product.image} alt={product.name} sizes="(min-width: 1024px) 560px, 100vw" priority />
        </div>

        <div>
          {product.brand && <p className="text-sm font-medium text-brand-700">{product.brand}</p>}
          <h1 className="mt-1 text-2xl leading-snug font-bold sm:text-3xl">{product.name}</h1>
          {product.summary && <p className="mt-2 text-muted">{product.summary}</p>}
          {avgRating && (
            <p className="mt-2 text-sm text-muted">
              <span className="text-amber-500">★</span> {avgRating} · 리뷰 {reviews.length}개
            </p>
          )}

          <p className="mt-5 text-3xl font-extrabold">{formatPrice(product.price)}</p>

          <dl className="mt-6 space-y-2 border-y border-line py-4 text-sm">
            <div className="flex">
              <dt className="w-20 shrink-0 text-muted">배송비</dt>
              <dd>
                {formatPrice(shippingFeeFor(1))} ({formatPrice(FREE_SHIPPING_THRESHOLD)} 이상 무료)
              </dd>
            </div>
            <div className="flex">
              <dt className="w-20 shrink-0 text-muted">재고</dt>
              <dd className={product.stock > 0 && product.stock < 10 ? "font-semibold text-red-600" : ""}>
                {product.stock > 0 ? `${product.stock}개 남음` : "품절"}
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            <AddToCart
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                image: product.image,
                price: product.price,
                stock: product.stock,
              }}
            />
          </div>

          {specs.length > 0 && (
            <div className="mt-8">
              <h2 className="font-bold">주요 사양</h2>
              <table className="mt-3 w-full overflow-hidden rounded-lg text-sm">
                <tbody>
                  {specs.map(([k, v]) => (
                    <tr key={k} className="border-b border-line last:border-0">
                      <th className="w-32 bg-surface px-3 py-2.5 text-left font-medium text-muted">{k}</th>
                      <td className="px-3 py-2.5">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <section className="mt-14">
        <h2 className="border-b-2 border-ink pb-3 text-lg font-bold">상품 설명</h2>
        <p className="mt-5 leading-relaxed whitespace-pre-line text-ink/90">{product.description}</p>
        {product.source_url && (
          <p className="mt-4 text-xs text-muted">
            가격·사양 참고:{" "}
            <a href={product.source_url} target="_blank" rel="noreferrer" className="underline hover:text-brand-700">
              디바이스마트 상품 페이지
            </a>
          </p>
        )}
      </section>

      <ReviewSection productId={product.id} productSlug={product.slug} reviews={reviews} user={user} />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-lg font-bold">같은 카테고리 상품</h2>
          <div className="mt-5">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}
