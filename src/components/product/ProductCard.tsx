import Link from "next/link";
import Image from "next/image";
import type { ProductWithCategory } from "@/lib/data";
import { formatPrice } from "@/lib/utils/format";

export function ProductImage({
  src,
  alt,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface text-xs text-muted">
        이미지 준비중
      </div>
    );
  }
  return (
    <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-contain p-3" />
  );
}

export default function ProductCard({ product }: { product: ProductWithCategory }) {
  const soldOut = product.stock <= 0;
  return (
    <Link href={`/products/${product.slug}`} className="group flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-line bg-white transition group-hover:border-brand-500">
        <ProductImage
          src={product.image}
          alt={product.name}
          sizes="(min-width: 1024px) 260px, (min-width: 640px) 33vw, 50vw"
        />
        {soldOut && (
          <span className="absolute top-2 left-2 rounded bg-ink px-2 py-0.5 text-xs font-semibold text-white">
            품절
          </span>
        )}
        {!soldOut && product.is_featured && (
          <span className="absolute top-2 left-2 rounded bg-brand-500 px-2 py-0.5 text-xs font-semibold text-white">
            추천
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-1 flex-col">
        {product.brand && <p className="text-xs text-muted">{product.brand}</p>}
        <p className="mt-0.5 line-clamp-2 text-sm font-medium text-ink group-hover:text-brand-700">
          {product.name}
        </p>
        <p className="mt-1.5 text-base font-bold">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: ProductWithCategory[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line py-20 text-center text-muted">
        조건에 맞는 상품이 없습니다.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
