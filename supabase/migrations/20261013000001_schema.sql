-- 아두이노 쇼핑몰 기본 스키마

-- 회원 프로필 ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  phone text not null default '',
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

-- 배송지 ------------------------------------------------------------------
create table public.addresses (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null default '',
  recipient text not null,
  phone text not null,
  zipcode text not null,
  address1 text not null,
  address2 text not null default '',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index addresses_user_id_idx on public.addresses (user_id);

-- 카테고리 ----------------------------------------------------------------
create table public.categories (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  description text not null default '',
  image text not null default '',
  sort_order int not null default 0
);

-- 상품 --------------------------------------------------------------------
create table public.products (
  id bigint generated always as identity primary key,
  category_id bigint not null references public.categories (id),
  slug text not null unique,
  name text not null,
  brand text not null default '',
  summary text not null default '',
  description text not null default '',
  price int not null check (price >= 0),
  stock int not null default 0 check (stock >= 0),
  specs jsonb not null default '{}'::jsonb,
  image text not null default '',
  source_url text not null default '',
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_id_idx on public.products (category_id);

-- 주문 --------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled')),
  order_name text not null,
  items_amount int not null,
  shipping_fee int not null,
  total_amount int not null,
  recipient text not null,
  phone text not null,
  zipcode text not null,
  address1 text not null,
  address2 text not null default '',
  memo text not null default '',
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  updated_at timestamptz not null default now()
);
create index orders_user_id_idx on public.orders (user_id);

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id bigint references public.products (id) on delete set null,
  product_name text not null,
  product_image text not null default '',
  unit_price int not null,
  quantity int not null check (quantity > 0)
);
create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

create table public.payments (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  payment_key text not null unique,
  method text not null default '',
  amount int not null,
  status text not null,
  approved_at timestamptz,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index payments_order_id_idx on public.payments (order_id);

-- 리뷰 --------------------------------------------------------------------
create table public.reviews (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null default '',
  rating int not null check (rating between 1 and 5),
  content text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index reviews_product_id_idx on public.reviews (product_id);
create index reviews_user_id_idx on public.reviews (user_id);

-- updated_at 자동 갱신 ----------------------------------------------------
create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
