-- Job board schema: companies post offers; each offer has salaries (one per contract type),
-- required skills and locations. Who may read or change what lives in the next migration.
--
-- Conventions:
-- - uuid ids; public URLs use slugs instead, which are readable and don't reveal row counts.
-- - Enums for small fixed sets; lookup tables for lists that grow (skills, cities…), since
--   enum values can be added but not easily removed or renamed.
-- - Rules live in check constraints too, not only in Zod: the database is the one place
--   every write passes through (forms, seed scripts, SQL run by hand, future code).
-- - Postgres doesn't index foreign keys automatically, so each one gets an index unless a
--   primary key already starts with that column.

-- Enums ------------------------------------------------------------------------------------

create type public.seniority as enum ('intern', 'junior', 'mid', 'senior', 'lead');
create type public.workplace as enum ('remote', 'hybrid', 'office');
create type public.employment_type as enum ('b2b', 'permanent', 'mandate');
create type public.salary_period as enum ('month', 'hour');
create type public.offer_status as enum ('draft', 'published', 'closed');
create type public.company_role as enum ('owner', 'recruiter');

-- Shared trigger: keep updated_at current on every update (a column default only applies
-- on insert). An empty search_path stops callers from swapping in their own objects.

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Lookups ----------------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null unique check (char_length(name) between 1 and 50)
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null unique check (char_length(name) between 1 and 50)
);

create table public.cities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null unique check (char_length(name) between 1 and 100)
);

-- Companies --------------------------------------------------------------------------------

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 100),
  name text not null check (char_length(name) between 1 and 100),
  website text check (website ~ '^https://'),
  -- A path in Supabase Storage, not a URL, so the bucket or domain can change later.
  logo_path text,
  description text not null default '' check (char_length(description) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger companies_set_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

-- Who may manage a company's offers. Deleting a user or company removes the membership.
create table public.company_members (
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.company_role not null default 'recruiter',
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create index company_members_user_id_idx on public.company_members (user_id);

-- Offers -----------------------------------------------------------------------------------

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  -- An offer can't outlive its company…
  company_id uuid not null references public.companies (id) on delete cascade,
  -- …but a category in use can't be deleted out from under live offers.
  category_id uuid not null references public.categories (id) on delete restrict,
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 150),
  title text not null check (char_length(title) between 3 and 120),
  -- Markdown.
  description text not null default '' check (char_length(description) <= 20000),
  seniority public.seniority not null,
  workplace public.workplace not null,
  status public.offer_status not null default 'draft',
  apply_url text not null check (apply_url ~ '^https://'),
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- A draft may still be missing dates; anything published (or closed after being
  -- published) must have both.
  constraint offers_published_have_dates check (
    status = 'draft' or (published_at is not null and expires_at is not null)
  ),
  constraint offers_expire_after_publishing check (expires_at > published_at)
);

create trigger offers_set_updated_at
before update on public.offers
for each row execute function public.set_updated_at();

create index offers_company_id_idx on public.offers (company_id);
create index offers_category_id_idx on public.offers (category_id);
-- The main listing: newest published offers first. A partial index only holds published
-- rows, so drafts and closed offers don't make it bigger.
create index offers_published_at_idx on public.offers (published_at desc)
  where status = 'published';

-- One salary range per contract type, e.g. B2B 20–25k and permanent 16–20k on one offer.
-- Whole currency units as integers: floats can't represent money exactly.
create table public.offer_salaries (
  offer_id uuid not null references public.offers (id) on delete cascade,
  employment_type public.employment_type not null,
  min_amount integer not null check (min_amount > 0),
  max_amount integer not null,
  currency text not null default 'PLN' check (currency ~ '^[A-Z]{3}$'),
  period public.salary_period not null default 'month',
  primary key (offer_id, employment_type),
  constraint offer_salaries_range_valid check (max_amount >= min_amount)
);

create table public.offer_skills (
  offer_id uuid not null references public.offers (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete restrict,
  level smallint not null check (level between 1 and 5),
  -- false means "nice to have".
  required boolean not null default true,
  primary key (offer_id, skill_id)
);

-- For "offers that need React": find offers by skill.
create index offer_skills_skill_id_idx on public.offer_skills (skill_id);

create table public.offer_locations (
  offer_id uuid not null references public.offers (id) on delete cascade,
  city_id uuid not null references public.cities (id) on delete restrict,
  primary key (offer_id, city_id)
);

create index offer_locations_city_id_idx on public.offer_locations (city_id);

-- Row Level Security on from the start: with RLS on and no policies, nobody can read or
-- write anything through the API. The next migration opens up exactly what's needed.

alter table public.categories enable row level security;
alter table public.skills enable row level security;
alter table public.cities enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.offers enable row level security;
alter table public.offer_salaries enable row level security;
alter table public.offer_skills enable row level security;
alter table public.offer_locations enable row level security;
