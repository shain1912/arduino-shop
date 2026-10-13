import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Category = Tables<"categories">;
export type Product = Tables<"products">;
export type ProductWithCategory = Product & {
  categories: Pick<Category, "slug" | "name"> | null;
};

export const SORT_OPTIONS = {
  new: { label: "신상품순", column: "created_at", ascending: false },
  price_asc: { label: "낮은 가격순", column: "price", ascending: true },
  price_desc: { label: "높은 가격순", column: "price", ascending: false },
  name: { label: "이름순", column: "name", ascending: true },
} as const;
export type SortKey = keyof typeof SORT_OPTIONS;

export function parseSort(value: string | string[] | undefined): SortKey {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v in SORT_OPTIONS ? (v as SortKey) : "new";
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("sort_order");
  return data ?? [];
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
  return data;
}

export async function getProducts(options: {
  categoryId?: number;
  query?: string;
  sort?: SortKey;
  featured?: boolean;
  limit?: number;
} = {}): Promise<ProductWithCategory[]> {
  const supabase = await createClient();
  const sort = SORT_OPTIONS[options.sort ?? "new"];
  let q = supabase
    .from("products")
    .select("*, categories(slug, name)")
    .eq("is_active", true)
    .order(sort.column, { ascending: sort.ascending })
    .order("id");

  if (options.categoryId) q = q.eq("category_id", options.categoryId);
  if (options.featured) q = q.eq("is_featured", true);
  if (options.query) {
    // PostgREST or 필터 구문을 깨뜨리는 문자는 제거
    const term = options.query.replace(/[%,().*]/g, " ").trim();
    if (term) q = q.or(`name.ilike.%${term}%,summary.ilike.%${term}%,brand.ilike.%${term}%`);
  }
  if (options.limit) q = q.limit(options.limit);

  const { data } = await q;
  return (data as ProductWithCategory[] | null) ?? [];
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories(slug, name)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return data as ProductWithCategory | null;
}

export async function getRelatedProducts(categoryId: number, excludeId: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories(slug, name)")
    .eq("is_active", true)
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .limit(4);
  return (data as ProductWithCategory[] | null) ?? [];
}

export async function getReviews(productId: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  return data ?? [];
}
