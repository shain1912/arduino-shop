"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Tables } from "@/types/database";
import { saveProduct, type ProductFormState } from "@/lib/actions/admin";
import { createClient } from "@/lib/supabase/client";
import { specsToEntries } from "@/lib/utils/format";

export default function ProductForm({
  categories,
  product,
}: {
  categories: Tables<"categories">[];
  product?: Tables<"products">;
}) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    saveProduct.bind(null, product?.id ?? null),
    {},
  );
  const [image, setImage] = useState(product?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("이미지 파일만 올릴 수 있습니다.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("5MB 이하 이미지만 올릴 수 있습니다.");
      return;
    }
    setUploading(true);
    setUploadError("");
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
    if (error) {
      setUploadError(`업로드 실패: ${error.message}`);
    } else {
      setImage(supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
    }
    setUploading(false);
  }

  const specsText = specsToEntries(product?.specs)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  return (
    <form action={formAction} className="mt-6 grid gap-6 xl:grid-cols-[1fr_300px]">
      <div className="card space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="name">
              상품명
            </label>
            <input id="name" name="name" className="input" defaultValue={product?.name} required />
          </div>
          <div>
            <label className="label" htmlFor="slug">
              주소용 이름 (slug)
            </label>
            <input
              id="slug"
              name="slug"
              className="input font-mono"
              defaultValue={product?.slug}
              placeholder="arduino-uno-r3"
              pattern="[a-z0-9\-]+"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="category_id">
              카테고리
            </label>
            <select id="category_id" name="category_id" className="input" defaultValue={product?.category_id ?? ""} required>
              <option value="" disabled>
                선택
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="price">
              가격 (원)
            </label>
            <input id="price" name="price" type="number" min={0} className="input" defaultValue={product?.price} required />
          </div>
          <div>
            <label className="label" htmlFor="stock">
              재고
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              min={0}
              className="input"
              defaultValue={product?.stock ?? 0}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="brand">
              브랜드·제조사
            </label>
            <input id="brand" name="brand" className="input" defaultValue={product?.brand} />
          </div>
          <div>
            <label className="label" htmlFor="source_url">
              참고 링크
            </label>
            <input id="source_url" name="source_url" type="url" className="input" defaultValue={product?.source_url} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="summary">
              한 줄 소개
            </label>
            <input id="summary" name="summary" className="input" maxLength={80} defaultValue={product?.summary} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="description">
              상세 설명
            </label>
            <textarea id="description" name="description" rows={5} className="input" defaultValue={product?.description} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="specs">
              주요 사양 <span className="font-normal text-muted">(한 줄에 &ldquo;항목: 값&rdquo;)</span>
            </label>
            <textarea
              id="specs"
              name="specs"
              rows={6}
              className="input font-mono text-xs"
              defaultValue={specsText}
              placeholder={"동작 전압: 5V\n인터페이스: I2C"}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card p-5">
          <p className="label">상품 이미지</p>
          <div className="relative aspect-square overflow-hidden rounded-lg border border-line bg-surface">
            {image ? (
              <Image src={image} alt="상품 이미지 미리보기" fill sizes="300px" className="object-contain p-2" />
            ) : (
              <p className="flex h-full items-center justify-center text-xs text-muted">이미지 없음</p>
            )}
          </div>
          <input type="hidden" name="image" value={image} />
          <label className="btn-outline mt-3 w-full cursor-pointer">
            {uploading ? "업로드 중..." : "이미지 업로드"}
            <input type="file" accept="image/*" className="sr-only" onChange={handleUpload} disabled={uploading} />
          </label>
          {uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}
        </div>

        <div className="card space-y-3 p-5 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} />
            판매중
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_featured" defaultChecked={product?.is_featured ?? false} />
            메인 추천 상품
          </label>
        </div>

        {state.error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}
        <div className="flex gap-2">
          <Link href="/admin/products" className="btn-outline flex-1">
            취소
          </Link>
          <button type="submit" className="btn-primary flex-1" disabled={pending || uploading}>
            {pending ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </form>
  );
}
