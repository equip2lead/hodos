-- Hodos Shop: Hodos's own products, guest checkout by phone, photo storage.

-- products: descriptions, promo price, featured flag
alter table hodos.products
  add column if not exists description_en text,
  add column if not exists description_fr text,
  add column if not exists compare_at_fcfa int check (compare_at_fcfa >= 0),
  add column if not exists featured boolean not null default false;

-- businesses: mark Hodos's own shop/station
alter table hodos.businesses add column if not exists is_hodos boolean not null default false;

-- orders: guests order with name + phone (no account needed)
alter table hodos.orders alter column customer_id drop not null;
alter table hodos.orders
  add column if not exists customer_name text,
  add column if not exists customer_phone text,
  add column if not exists lat double precision,
  add column if not exists lng double precision;

-- category photos live in the web app under /img/cat/<slug>.jpg
update hodos.categories set image_url = '/img/cat/' || slug || '.jpg';

-- The Hodos Shop, owned by the first super admin
insert into hodos.businesses (owner_id, category_id, kind, name, slug, description, city, address, delivery_fee_fcfa, status, plan, is_hodos, approved_at)
select p.id, (select id from hodos.categories where slug = 'groceries'), 'order', 'Hodos Shop', 'hodos-shop',
       'Produits Hodos : parfums, savons et produits d''entretien. Livrés chez vous ou à retirer à la station Hodos.',
       'Yaoundé', 'Station Hodos (adresse à confirmer)', 1000, 'approved', 'featured', true, now()
from hodos.profiles p where p.role = 'super_admin'
order by p.created_at limit 1
on conflict (slug) do nothing;

-- Products: Youghazi perfumes (real) + sample cleaning products (replace from /admin/products)
insert into hodos.products (business_id, section, name_en, name_fr, price_fcfa, compare_at_fcfa, image_url, featured, sort, description_fr, description_en)
select b.id, x.section, x.name_en, x.name_fr, x.price, x.compare_at, x.img, true, x.sort, x.dfr, x.den
from hodos.businesses b,
(values
  ('Parfums', 'Youghazi Pour Femme 50 ml', 'Youghazi Pour Femme 50 ml', 15000, null::int, '/img/products/youghazi-femme.jpg', 1, 'Youghazi Fragrance Collection. Eau de parfum pour femme, 50 ml.', 'Youghazi Fragrance Collection. Eau de parfum for women, 50 ml.'),
  ('Parfums', 'Youghazi Pour Homme 50 ml', 'Youghazi Pour Homme 50 ml', 15000, null::int, '/img/products/youghazi-homme.jpg', 2, 'Youghazi Fragrance Collection. Eau de parfum pour homme, 50 ml.', 'Youghazi Fragrance Collection. Eau de parfum for men, 50 ml.'),
  ('Parfums', 'Youghazi Duo: Him & Her', 'Coffret Duo Youghazi : Lui & Elle', 27000, 30000, '/img/products/youghazi-duo.jpg', 3, 'Pour Homme + Pour Femme, 2 × 50 ml. Idéal en cadeau.', 'Pour Homme + Pour Femme, 2 × 50 ml. A perfect gift.'),
  ('Entretien', 'Shea black soap 200 g', 'Savon noir au karité 200 g', 1500, null::int, null, 10, 'Savon naturel au beurre de karité.', 'Natural soap with shea butter.'),
  ('Entretien', 'Dishwashing liquid 1 L', 'Liquide vaisselle 1 L', 1200, 1500, null, 11, 'Dégraisse vite, parfum citron.', 'Cuts grease fast, lemon scent.'),
  ('Entretien', 'Bleach 1 L', 'Eau de Javel 1 L', 800, null::int, null, 12, 'Désinfecte sols, sanitaires et linge blanc.', 'Disinfects floors, toilets and whites.'),
  ('Entretien', 'Washing powder 1 kg', 'Lessive en poudre 1 kg', 1800, null::int, null, 13, 'Linge propre, main et machine.', 'Clean laundry, hand and machine.')
) as x(section, name_en, name_fr, price, compare_at, img, sort, dfr, den)
where b.slug = 'hodos-shop'
  and not exists (select 1 from hodos.products p where p.business_id = b.id);

-- Place an order. Prices always come from the database, never from the browser.
create or replace function hodos.place_order(
  p_business uuid, p_items jsonb, p_mode hodos.order_mode, p_payment hodos.payment_method,
  p_name text, p_phone text, p_address text default null, p_zone text default null,
  p_lat double precision default null, p_lng double precision default null, p_note text default null)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_biz hodos.businesses;
  v_order uuid; v_code text; v_sub int := 0; v_cnt int := 0; r record; v_uid uuid := auth.uid();
begin
  select * into v_biz from hodos.businesses where id = p_business and status = 'approved' and kind = 'order';
  if not found then raise exception 'business_unavailable'; end if;
  if coalesce(length(trim(p_name)), 0) < 2 then raise exception 'name_required'; end if;
  if coalesce(length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')), 0) < 8 then raise exception 'phone_required'; end if;
  if p_mode = 'delivery' and coalesce(length(trim(p_address)), 0) < 3 then raise exception 'address_required'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 50 then raise exception 'cart_empty'; end if;
  if v_uid is not null and not exists (select 1 from hodos.profiles where id = v_uid) then v_uid := null; end if;

  insert into hodos.orders (customer_id, business_id, mode, address, zone, lat, lng, payment, customer_name, customer_phone, note, delivery_fee_fcfa)
  values (v_uid, p_business, p_mode, left(p_address, 300), left(p_zone, 100), p_lat, p_lng, p_payment,
          left(trim(p_name), 100), left(trim(p_phone), 30), left(p_note, 500),
          case when p_mode = 'delivery' then v_biz.delivery_fee_fcfa else 0 end)
  returning id, code into v_order, v_code;

  for r in
    select p.id, p.name_fr, p.price_fcfa, least(greatest(coalesce((i->>'qty')::int, 1), 1), 99) as qty
    from jsonb_array_elements(p_items) i
    join hodos.products p on p.id = (i->>'product_id')::uuid
    where p.business_id = p_business and p.in_stock
  loop
    insert into hodos.order_items (order_id, product_id, name, qty, unit_price_fcfa) values (v_order, r.id, r.name_fr, r.qty, r.price_fcfa);
    v_sub := v_sub + r.qty * r.price_fcfa; v_cnt := v_cnt + 1;
  end loop;
  if v_cnt = 0 then raise exception 'cart_empty'; end if;
  update hodos.orders set subtotal_fcfa = v_sub where id = v_order;
  return v_code;
end; $$;

-- Read one order by its code (the code works like a receipt number)
create or replace function hodos.get_order(p_code text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'code', o.code, 'status', o.status, 'mode', o.mode, 'payment', o.payment,
    'address', o.address, 'name', o.customer_name, 'subtotal', o.subtotal_fcfa,
    'delivery_fee', o.delivery_fee_fcfa, 'total', o.total_fcfa, 'created_at', o.created_at,
    'business', jsonb_build_object('name', b.name, 'address', b.address, 'phone', b.phone, 'whatsapp', b.whatsapp),
    'items', coalesce((select jsonb_agg(jsonb_build_object('name', i.name, 'qty', i.qty, 'price', i.unit_price_fcfa)) from hodos.order_items i where i.order_id = o.id), '[]'::jsonb))
  from hodos.orders o join hodos.businesses b on b.id = o.business_id
  where o.code = p_code;
$$;

revoke execute on function hodos.place_order(uuid, jsonb, hodos.order_mode, hodos.payment_method, text, text, text, text, double precision, double precision, text) from public;
revoke execute on function hodos.get_order(text) from public;
grant execute on function hodos.place_order(uuid, jsonb, hodos.order_mode, hodos.payment_method, text, text, text, text, double precision, double precision, text) to anon, authenticated;
grant execute on function hodos.get_order(text) to anon, authenticated;

-- Public bucket for product and shop photos; only admins and shop owners upload.
insert into storage.buckets (id, name, public) values ('hodos-media', 'hodos-media', true) on conflict (id) do nothing;
create policy hodos_media_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'hodos-media' and hodos.is_admin());
create policy hodos_media_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'hodos-media' and hodos.is_admin());
create policy hodos_media_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'hodos-media' and hodos.is_admin());
