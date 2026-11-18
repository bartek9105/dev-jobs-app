-- Who may read and change the job board tables. Two layers:
--
-- 1. Grants: which operations a role may attempt on a table at all. Supabase grants
--    everything on public tables to `anon` and `authenticated` by default, so start from
--    nothing and grant only what the app uses.
-- 2. RLS policies: which rows those operations may touch.
--
-- Roles: `anon` is a signed-out visitor, `authenticated` a signed-in user. Both reach the
-- database through the public API with the publishable key, so these rules are what
-- protects the data, whatever the Next.js code does.

-- Helpers ----------------------------------------------------------------------------------

-- In a schema the API doesn't expose, so it can't be called directly as an RPC.
create schema if not exists private;
grant usage on schema private to authenticated;

-- Whether the signed-in user belongs to a company. `security definer` runs it as its owner,
-- so it can read company_members without that table's own policies getting in the way
-- (a policy that queries a table guarded by policies that query it back recurses).
-- `(select auth.uid())` is evaluated once per statement instead of once per row.
create function private.is_company_member(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.company_members
    where company_id = target_company_id
      and user_id = (select auth.uid())
  );
$$;

revoke execute on function private.is_company_member(uuid) from public;
grant execute on function private.is_company_member(uuid) to authenticated;

-- Whether the signed-in user may change an offer's details (salaries, skills, locations):
-- they belong to the company that owns it.
create function private.can_manage_offer(target_offer_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.offers o
    join public.company_members m on m.company_id = o.company_id
    where o.id = target_offer_id
      and m.user_id = (select auth.uid())
  );
$$;

revoke execute on function private.can_manage_offer(uuid) from public;
grant execute on function private.can_manage_offer(uuid) to authenticated;

-- Grants -----------------------------------------------------------------------------------

revoke all on
  public.categories,
  public.skills,
  public.cities,
  public.companies,
  public.company_members,
  public.offers,
  public.offer_salaries,
  public.offer_skills,
  public.offer_locations
from anon, authenticated;

grant select on
  public.categories,
  public.skills,
  public.cities,
  public.companies,
  public.offers,
  public.offer_salaries,
  public.offer_skills,
  public.offer_locations
to anon, authenticated;

grant select on public.company_members to authenticated;

-- Members may edit their company's profile, but not its id, slug or timestamps.
grant update (name, website, logo_path, description) on public.companies to authenticated;

grant insert, update, delete on
  public.offers,
  public.offer_salaries,
  public.offer_skills,
  public.offer_locations
to authenticated;

-- Lookups: everyone reads; only migrations and seed data write. -----------------------------

create policy "Anyone can read categories"
on public.categories for select to anon, authenticated using (true);

create policy "Anyone can read skills"
on public.skills for select to anon, authenticated using (true);

create policy "Anyone can read cities"
on public.cities for select to anon, authenticated using (true);

-- Companies --------------------------------------------------------------------------------

create policy "Anyone can read companies"
on public.companies for select to anon, authenticated using (true);

create policy "Members can update their company"
on public.companies for update to authenticated
using (private.is_company_member(id))
with check (private.is_company_member(id));

-- Users see their own memberships (to know which companies they manage), not anyone else's.
create policy "Users can read their own memberships"
on public.company_members for select to authenticated
using (user_id = (select auth.uid()));

-- Offers -----------------------------------------------------------------------------------

-- Public means published, already live and not yet expired. One select policy per role:
-- several permissive policies for the same role all run on every row.
create policy "Visitors can read live offers"
on public.offers for select to anon
using (status = 'published' and published_at <= now() and expires_at > now());

create policy "Users can read live offers and their company's offers"
on public.offers for select to authenticated
using (
  (status = 'published' and published_at <= now() and expires_at > now())
  or private.is_company_member(company_id)
);

-- `with check` tests the row as it will be after the write, so a member can't move an offer
-- to a company they don't belong to.
create policy "Members can create their company's offers"
on public.offers for insert to authenticated
with check (private.is_company_member(company_id));

create policy "Members can update their company's offers"
on public.offers for update to authenticated
using (private.is_company_member(company_id))
with check (private.is_company_member(company_id));

create policy "Members can delete their company's offers"
on public.offers for delete to authenticated
using (private.is_company_member(company_id));

-- Offer details ----------------------------------------------------------------------------
-- Readable whenever the offer itself is: the subquery on offers runs under the offers
-- policies above, so salaries of a draft stay as hidden as the draft. Writable by members
-- of the offer's company. Writes get separate insert/update/delete policies rather than
-- `for all`, which would add a second select policy for signed-in users.

create policy "Anyone can read salaries of visible offers"
on public.offer_salaries for select to anon, authenticated
using (exists (select 1 from public.offers o where o.id = offer_id));

create policy "Members can add their offers' salaries"
on public.offer_salaries for insert to authenticated
with check (private.can_manage_offer(offer_id));

create policy "Members can update their offers' salaries"
on public.offer_salaries for update to authenticated
using (private.can_manage_offer(offer_id))
with check (private.can_manage_offer(offer_id));

create policy "Members can delete their offers' salaries"
on public.offer_salaries for delete to authenticated
using (private.can_manage_offer(offer_id));

create policy "Anyone can read skills of visible offers"
on public.offer_skills for select to anon, authenticated
using (exists (select 1 from public.offers o where o.id = offer_id));

create policy "Members can add their offers' skills"
on public.offer_skills for insert to authenticated
with check (private.can_manage_offer(offer_id));

create policy "Members can update their offers' skills"
on public.offer_skills for update to authenticated
using (private.can_manage_offer(offer_id))
with check (private.can_manage_offer(offer_id));

create policy "Members can delete their offers' skills"
on public.offer_skills for delete to authenticated
using (private.can_manage_offer(offer_id));

create policy "Anyone can read locations of visible offers"
on public.offer_locations for select to anon, authenticated
using (exists (select 1 from public.offers o where o.id = offer_id));

create policy "Members can add their offers' locations"
on public.offer_locations for insert to authenticated
with check (private.can_manage_offer(offer_id));

create policy "Members can update their offers' locations"
on public.offer_locations for update to authenticated
using (private.can_manage_offer(offer_id))
with check (private.can_manage_offer(offer_id));

create policy "Members can delete their offers' locations"
on public.offer_locations for delete to authenticated
using (private.can_manage_offer(offer_id));
