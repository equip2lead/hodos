-- Formations: courses people can sign up and pay for (CapCut, leadership, ...)

create table if not exists hodos.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_fr text not null,
  title_en text not null,
  summary_fr text,
  summary_en text,
  trainer text,
  format text not null default 'presentiel' check (format in ('presentiel', 'en_ligne', 'hybride')),
  location text,
  price_fcfa int not null default 0 check (price_fcfa >= 0),
  starts_on date,
  schedule_fr text,
  schedule_en text,
  seats int check (seats > 0),
  color text not null default '#D3121F',
  image_url text,
  is_published boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists hodos.enrollments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('HF-' || lpad((floor(random() * 10000))::int::text, 4, '0') || substr(md5(random()::text), 1, 2)),
  course_id uuid not null references hodos.courses(id) on delete restrict,
  customer_id uuid references hodos.profiles(id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  payment hodos.payment_method not null,
  amount_fcfa int not null default 0,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'paid', 'cancelled')),
  note text,
  created_at timestamptz not null default now()
);
create index if not exists enrollments_course_idx on hodos.enrollments (course_id, status);

alter table hodos.courses enable row level security;
alter table hodos.enrollments enable row level security;

create policy courses_read on hodos.courses for select to anon, authenticated using (is_published or hodos.is_admin());
create policy courses_admin on hodos.courses for all to authenticated using (hodos.is_admin()) with check (hodos.is_admin());
create policy enrollments_admin on hodos.enrollments for all to authenticated using (hodos.is_admin()) with check (hodos.is_admin());

grant select on hodos.courses to anon;
grant select, insert, update, delete on hodos.courses, hodos.enrollments to authenticated;
grant all on hodos.courses, hodos.enrollments to service_role;

-- Seats left (counts every sign-up that isn't cancelled)
create or replace function hodos.seats_left(p_course uuid)
returns int language sql stable security definer set search_path = '' as $$
  select case when c.seats is null then null
              else greatest(c.seats - (select count(*) from hodos.enrollments e where e.course_id = c.id and e.status <> 'cancelled'), 0)::int end
  from hodos.courses c where c.id = p_course;
$$;

-- Sign up for a course; the price comes from the database.
create or replace function hodos.enroll(
  p_course uuid, p_name text, p_phone text, p_payment hodos.payment_method,
  p_email text default null, p_note text default null)
returns text language plpgsql security definer set search_path = '' as $$
declare v_course hodos.courses; v_code text; v_left int; v_uid uuid := auth.uid();
begin
  select * into v_course from hodos.courses where id = p_course and is_published;
  if not found then raise exception 'course_unavailable'; end if;
  if coalesce(length(trim(p_name)), 0) < 2 then raise exception 'name_required'; end if;
  if coalesce(length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')), 0) < 8 then raise exception 'phone_required'; end if;
  v_left := hodos.seats_left(p_course);
  if v_left is not null and v_left <= 0 then raise exception 'course_full'; end if;
  if v_uid is not null and not exists (select 1 from hodos.profiles where id = v_uid) then v_uid := null; end if;
  insert into hodos.enrollments (course_id, customer_id, name, phone, email, payment, amount_fcfa, note)
  values (p_course, v_uid, left(trim(p_name), 100), left(trim(p_phone), 30), left(nullif(trim(p_email), ''), 120), p_payment, v_course.price_fcfa, left(p_note, 500))
  returning code into v_code;
  return v_code;
end; $$;

create or replace function hodos.get_enrollment(p_code text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'code', e.code, 'status', e.status, 'name', e.name, 'payment', e.payment, 'amount', e.amount_fcfa,
    'course', jsonb_build_object('slug', c.slug, 'title_fr', c.title_fr, 'title_en', c.title_en, 'location', c.location,
                                 'starts_on', c.starts_on, 'schedule_fr', c.schedule_fr, 'schedule_en', c.schedule_en, 'format', c.format))
  from hodos.enrollments e join hodos.courses c on c.id = e.course_id
  where e.code = p_code;
$$;

revoke execute on function hodos.seats_left(uuid) from public;
revoke execute on function hodos.enroll(uuid, text, text, hodos.payment_method, text, text) from public;
revoke execute on function hodos.get_enrollment(text) from public;
grant execute on function hodos.seats_left(uuid) to anon, authenticated;
grant execute on function hodos.enroll(uuid, text, text, hodos.payment_method, text, text) to anon, authenticated;
grant execute on function hodos.get_enrollment(text) to anon, authenticated;

-- First two courses (prices, dates and places to confirm in /admin/courses)
insert into hodos.courses (slug, title_fr, title_en, summary_fr, summary_en, trainer, format, location, price_fcfa, schedule_fr, schedule_en, seats, color, sort)
values
  ('capcut-masterclass', 'CapCut Masterclass : montez vos vidéos sur téléphone', 'CapCut Masterclass: edit videos on your phone',
   'Apprenez à monter des vidéos pro pour TikTok, Instagram, WhatsApp et votre business : coupes, sous-titres, musique, transitions, export HD.',
   'Learn to edit pro videos for TikTok, Instagram, WhatsApp and your business: cuts, captions, music, transitions, HD export.',
   'Hodos Academy', 'presentiel', 'Nkomkana, face entrée 8e, immeuble vert', 15000,
   'Dates bientôt annoncées', 'Dates coming soon', 20, '#1B1112', 1),
  ('leadership-equip2lead', 'Développement du leadership avec Equip2Lead', 'Leadership development with Equip2Lead',
   'Grandissez comme leader : vision, influence, gestion d''équipe et prise de décision. Formation pratique avec Equip2Lead.',
   'Grow as a leader: vision, influence, team management and decision-making. A practical training with Equip2Lead.',
   'Equip2Lead', 'presentiel', 'Nkomkana, face entrée 8e, immeuble vert', 25000,
   'Dates bientôt annoncées', 'Dates coming soon', 30, '#D3121F', 2)
on conflict (slug) do nothing;
