-- 인증 연동, 권한(RLS), 스토리지

-- 관리자 여부 -------------------------------------------------------------
create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- 가입 시 프로필 생성 -----------------------------------------------------
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 데모 운영: 이메일 인증 없이 바로 로그인할 수 있도록 가입 즉시 인증 처리
create function public.auto_confirm_email() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.email_confirmed_at = coalesce(new.email_confirmed_at, now());
  return new;
end;
$$;

create trigger on_auth_user_auto_confirm before insert on auth.users
  for each row execute function public.auto_confirm_email();

-- 리뷰 작성자 이름은 프로필에서 가져온다 ----------------------------------
create function public.set_review_author() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  select coalesce(nullif(name, ''), '구매자') into new.author_name
  from public.profiles where id = new.user_id;
  return new;
end;
$$;

create trigger reviews_set_author before insert on public.reviews
  for each row execute function public.set_review_author();

-- RLS ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;

-- profiles: 본인 조회·수정(이름, 연락처만), 관리자 전체 조회
create policy "profiles select own or admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "profiles update own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke update on public.profiles from anon, authenticated;
grant update (name, phone) on public.profiles to authenticated;

-- addresses: 본인만
create policy "addresses own" on public.addresses
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- categories: 전체 조회, 관리자 쓰기
create policy "categories read" on public.categories
  for select to anon, authenticated using (true);
create policy "categories admin insert" on public.categories
  for insert to authenticated with check ((select public.is_admin()));
create policy "categories admin update" on public.categories
  for update to authenticated using ((select public.is_admin()));
create policy "categories admin delete" on public.categories
  for delete to authenticated using ((select public.is_admin()));

-- products: 판매 중 상품은 전체 조회, 관리자는 전부 조회·쓰기
create policy "products read" on public.products
  for select to anon, authenticated
  using (is_active or (select public.is_admin()));
create policy "products admin insert" on public.products
  for insert to authenticated with check ((select public.is_admin()));
create policy "products admin update" on public.products
  for update to authenticated using ((select public.is_admin()));
create policy "products admin delete" on public.products
  for delete to authenticated using ((select public.is_admin()));

-- orders: 본인·관리자 조회, 생성은 create_order 함수로만, 상태 변경은 관리자
create policy "orders select own or admin" on public.orders
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "orders admin update" on public.orders
  for update to authenticated using ((select public.is_admin()));

create policy "order_items select own or admin" on public.order_items
  for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_id
      and (o.user_id = (select auth.uid()) or (select public.is_admin()))
  ));

create policy "payments select own or admin" on public.payments
  for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_id
      and (o.user_id = (select auth.uid()) or (select public.is_admin()))
  ));

-- reviews: 전체 조회, 로그인 사용자 본인 명의로 작성, 본인·관리자 삭제
create policy "reviews read" on public.reviews
  for select to anon, authenticated using (true);
create policy "reviews insert own" on public.reviews
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "reviews delete own or admin" on public.reviews
  for delete to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- 상품 이미지 스토리지 ----------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product images admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));
create policy "product images admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));
create policy "product images admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));
