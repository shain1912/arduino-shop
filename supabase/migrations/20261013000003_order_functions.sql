-- 주문 생성·결제 확정·주문 취소 함수

-- 배송비: 30,000원 이상 무료, 미만 3,000원
create function public.shipping_fee_for(p_items_amount int) returns int
language sql immutable set search_path = '' as $$
  select case when p_items_amount >= 30000 then 0 else 3000 end;
$$;

-- 주문 생성 (가격은 클라이언트 값이 아니라 DB의 상품 가격으로 계산)
-- p_items: [{"product_id": 1, "quantity": 2}, ...]
create function public.create_order(
  p_items jsonb,
  p_recipient text,
  p_phone text,
  p_zipcode text,
  p_address1 text,
  p_address2 text default '',
  p_memo text default ''
) returns table (id uuid, order_no text, order_name text, total_amount int)
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_user uuid := auth.uid();
  v_order_id uuid := gen_random_uuid();
  v_order_no text;
  v_items_amount int := 0;
  v_count int := 0;
  v_first_name text;
  v_item record;
begin
  if v_user is null then
    raise exception 'LOGIN_REQUIRED';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_CART';
  end if;
  if coalesce(trim(p_recipient), '') = '' or coalesce(trim(p_phone), '') = ''
     or coalesce(trim(p_zipcode), '') = '' or coalesce(trim(p_address1), '') = '' then
    raise exception 'ADDRESS_REQUIRED';
  end if;

  v_order_no := 'AS' || to_char(now() at time zone 'Asia/Seoul', 'YYYYMMDD')
    || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));

  -- 주문 행을 먼저 만들고 금액은 아래에서 채운다
  insert into public.orders (
    id, order_no, user_id, order_name, items_amount, shipping_fee, total_amount,
    recipient, phone, zipcode, address1, address2, memo
  ) values (
    v_order_id, v_order_no, v_user, '', 0, 0, 0,
    trim(p_recipient), trim(p_phone), trim(p_zipcode), trim(p_address1),
    trim(coalesce(p_address2, '')), trim(coalesce(p_memo, ''))
  );

  for v_item in
    select p.id as product_id, p.name, p.image, p.price, p.stock, i.quantity
    from (
      select (e ->> 'product_id')::bigint as product_id,
             sum((e ->> 'quantity')::int)::int as quantity
      from jsonb_array_elements(p_items) e
      group by 1
    ) i
    left join public.products p on p.id = i.product_id and p.is_active
    order by i.product_id
  loop
    if v_item.product_id is null then
      raise exception 'PRODUCT_NOT_FOUND';
    end if;
    if v_item.quantity is null or v_item.quantity < 1 or v_item.quantity > 99 then
      raise exception 'INVALID_QUANTITY';
    end if;
    if v_item.stock < v_item.quantity then
      raise exception 'OUT_OF_STOCK:%', v_item.name;
    end if;

    insert into public.order_items (order_id, product_id, product_name, product_image, unit_price, quantity)
    values (v_order_id, v_item.product_id, v_item.name, v_item.image, v_item.price, v_item.quantity);

    v_items_amount := v_items_amount + v_item.price * v_item.quantity;
    v_count := v_count + 1;
    if v_first_name is null then
      v_first_name := v_item.name;
    end if;
  end loop;

  update public.orders o set
    order_name = case when v_count > 1 then v_first_name || ' 외 ' || (v_count - 1) || '건' else v_first_name end,
    items_amount = v_items_amount,
    shipping_fee = public.shipping_fee_for(v_items_amount),
    total_amount = v_items_amount + public.shipping_fee_for(v_items_amount)
  where o.id = v_order_id;

  return query
    select o.id, o.order_no, o.order_name, o.total_amount
    from public.orders o where o.id = v_order_id;
end;
$$;

revoke execute on function public.create_order from public, anon;
grant execute on function public.create_order to authenticated;

-- 결제 확정: 토스 결제 승인 후 서버(service_role)에서만 호출
-- 재고 차감과 상태 변경을 한 트랜잭션으로 처리한다
create function public.finalize_payment(
  p_order_no text,
  p_payment_key text,
  p_method text,
  p_amount int,
  p_approved_at timestamptz,
  p_raw jsonb
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_order public.orders;
  v_item record;
begin
  select * into v_order from public.orders where order_no = p_order_no for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  -- 같은 결제를 두 번 확정하는 경우(새로고침 등)는 그대로 성공 처리
  if v_order.status <> 'pending' then
    if exists (select 1 from public.payments where order_id = v_order.id and payment_key = p_payment_key) then
      return v_order.id;
    end if;
    raise exception 'ORDER_NOT_PENDING';
  end if;

  if v_order.total_amount <> p_amount then
    raise exception 'AMOUNT_MISMATCH';
  end if;

  for v_item in
    select product_id, product_name, quantity from public.order_items
    where order_id = v_order.id and product_id is not null
  loop
    update public.products set stock = stock - v_item.quantity
    where id = v_item.product_id and stock >= v_item.quantity;
    if not found then
      raise exception 'OUT_OF_STOCK:%', v_item.product_name;
    end if;
  end loop;

  update public.orders set status = 'paid', paid_at = coalesce(p_approved_at, now())
  where id = v_order.id;

  insert into public.payments (order_id, payment_key, method, amount, status, approved_at, raw)
  values (v_order.id, p_payment_key, coalesce(p_method, ''), p_amount, 'DONE', p_approved_at, coalesce(p_raw, '{}'::jsonb));

  return v_order.id;
end;
$$;

revoke execute on function public.finalize_payment from public, anon, authenticated;
grant execute on function public.finalize_payment to service_role;

-- 결제 전(pending) 주문은 본인이 취소할 수 있다
create function public.cancel_pending_order(p_order_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.orders set status = 'cancelled'
  where id = p_order_id and user_id = auth.uid() and status = 'pending';
  if not found then
    raise exception 'CANNOT_CANCEL';
  end if;
end;
$$;

revoke execute on function public.cancel_pending_order from public, anon;
grant execute on function public.cancel_pending_order to authenticated;

-- 다른 함수들도 익명 실행 권한을 정리한다
revoke execute on function public.handle_new_user from public, anon, authenticated;
revoke execute on function public.auto_confirm_email from public, anon, authenticated;
revoke execute on function public.set_review_author from public, anon, authenticated;
revoke execute on function public.set_updated_at from public, anon, authenticated;
