-- Access rules for the job board tables, tested the way the API uses them: switch to the
-- `anon` or `authenticated` role (with a user id in the JWT claims) and try things.
-- Everything runs in one transaction that's rolled back, so the database is left untouched.
-- Run with: npm run db:test

begin;

create extension if not exists pgtap with schema extensions;

select plan(26);

-- Fixtures (as postgres, which bypasses RLS) ------------------------------------------------

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'member@example.test'),
  ('00000000-0000-0000-0000-00000000000b', 'outsider@example.test');

insert into public.categories (id, slug, name) values
  ('c0000000-0000-0000-0000-000000000001', 'frontend', 'Frontend');

insert into public.companies (id, slug, name) values
  ('a0000000-0000-0000-0000-000000000000', 'company-a', 'Company A'),
  ('b0000000-0000-0000-0000-000000000000', 'company-b', 'Company B');

insert into public.company_members (company_id, user_id, role) values
  ('a0000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-00000000000a', 'owner');

insert into public.offers
  (id, company_id, category_id, slug, title, seniority, workplace, apply_url,
   status, published_at, expires_at)
values
  -- Company A: live, draft, expired, and published but not live yet.
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000000',
   'c0000000-0000-0000-0000-000000000001', 'a-live', 'Live A', 'mid', 'remote',
   'https://a.example.test/apply', 'published', now() - interval '1 day', now() + interval '30 days'),
  ('a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000000',
   'c0000000-0000-0000-0000-000000000001', 'a-draft', 'Draft A', 'mid', 'remote',
   'https://a.example.test/apply', 'draft', null, null),
  ('a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000000',
   'c0000000-0000-0000-0000-000000000001', 'a-expired', 'Expired A', 'mid', 'remote',
   'https://a.example.test/apply', 'published', now() - interval '60 days', now() - interval '1 day'),
  ('a0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000000',
   'c0000000-0000-0000-0000-000000000001', 'a-scheduled', 'Scheduled A', 'mid', 'remote',
   'https://a.example.test/apply', 'published', now() + interval '1 day', now() + interval '30 days'),
  -- Company B: live and draft.
  ('b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000000',
   'c0000000-0000-0000-0000-000000000001', 'b-live', 'Live B', 'senior', 'office',
   'https://b.example.test/apply', 'published', now() - interval '1 day', now() + interval '30 days'),
  ('b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000000',
   'c0000000-0000-0000-0000-000000000001', 'b-draft', 'Draft B', 'senior', 'office',
   'https://b.example.test/apply', 'draft', null, null);

insert into public.offer_salaries (offer_id, employment_type, min_amount, max_amount) values
  ('a0000000-0000-0000-0000-000000000001', 'b2b', 20000, 25000),
  ('a0000000-0000-0000-0000-000000000002', 'b2b', 20000, 25000),
  ('b0000000-0000-0000-0000-000000000002', 'b2b', 30000, 35000);

-- Constraints: rules the database enforces whoever writes -----------------------------------

select throws_ok(
  $$ insert into public.companies (slug, name) values ('Not A Slug', 'Bad') $$,
  '23514', null, 'slugs must be lowercase words joined by hyphens'
);

select throws_ok(
  $$ insert into public.offer_salaries (offer_id, employment_type, min_amount, max_amount)
     values ('a0000000-0000-0000-0000-000000000001', 'permanent', 20000, 10000) $$,
  '23514', null, 'a salary range can''t end below where it starts'
);

select throws_ok(
  $$ update public.offers set status = 'published'
     where id = 'b0000000-0000-0000-0000-000000000002' $$,
  '23514', null, 'a published offer needs publish and expiry dates'
);

-- Signed-out visitor ------------------------------------------------------------------------

set local role anon;

select set_eq(
  'select id from public.offers',
  array['a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001']::uuid[],
  'visitors see only live offers: no drafts, expired or not-yet-published ones'
);

select set_eq(
  'select offer_id from public.offer_salaries',
  array['a0000000-0000-0000-0000-000000000001']::uuid[],
  'visitors see salaries only of live offers'
);

select is(
  (select count(*)::int from public.companies), 2,
  'visitors can read companies'
);

select throws_ok(
  $$ insert into public.offers (company_id, category_id, slug, title, seniority, workplace, apply_url)
     values ('a0000000-0000-0000-0000-000000000000', 'c0000000-0000-0000-0000-000000000001',
             'anon-offer', 'Anon offer', 'mid', 'remote', 'https://x.example.test') $$,
  '42501', null, 'visitors can''t create offers'
);

select throws_ok(
  'select * from public.company_members',
  '42501', null, 'visitors can''t read memberships'
);

select throws_ok(
  $$ select private.is_company_member('a0000000-0000-0000-0000-000000000000') $$,
  '42501', null, 'visitors can''t call the private helpers'
);

reset role;

-- Signed-in user with no company ------------------------------------------------------------

select set_config(
  'request.jwt.claims',
  '{"sub": "00000000-0000-0000-0000-00000000000b", "role": "authenticated"}',
  true
);
set local role authenticated;

select set_eq(
  'select id from public.offers',
  array['a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001']::uuid[],
  'a user outside a company sees only live offers'
);

select throws_ok(
  $$ insert into public.offers (company_id, category_id, slug, title, seniority, workplace, apply_url)
     values ('a0000000-0000-0000-0000-000000000000', 'c0000000-0000-0000-0000-000000000001',
             'outsider-offer', 'Outsider offer', 'mid', 'remote', 'https://x.example.test') $$,
  '42501', null, 'a user can''t create offers for a company they don''t belong to'
);

update public.offers set title = 'Hijacked'
where id = 'a0000000-0000-0000-0000-000000000001';

select is(
  (select title from public.offers where id = 'a0000000-0000-0000-0000-000000000001'),
  'Live A',
  'a user can''t edit another company''s offer (the update matches no rows)'
);

select is_empty(
  'select * from public.company_members',
  'a user with no company sees no memberships'
);

reset role;

-- Company A member --------------------------------------------------------------------------

select set_config(
  'request.jwt.claims',
  '{"sub": "00000000-0000-0000-0000-00000000000a", "role": "authenticated"}',
  true
);
set local role authenticated;

select set_eq(
  'select id from public.offers',
  array[
    'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000001'
  ]::uuid[],
  'a member sees every offer of their company, plus other companies'' live offers'
);

select set_eq(
  'select offer_id from public.offer_salaries',
  array['a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002']::uuid[],
  'a member sees their drafts'' salaries, but not another company''s'
);

select set_eq(
  'select company_id from public.company_members',
  array['a0000000-0000-0000-0000-000000000000']::uuid[],
  'a member sees their own membership'
);

select lives_ok(
  $$ update public.offers set title = 'Draft A, edited'
     where id = 'a0000000-0000-0000-0000-000000000002' $$,
  'a member can edit their company''s offer'
);

select is(
  (select title from public.offers where id = 'a0000000-0000-0000-0000-000000000002'),
  'Draft A, edited',
  'the edit is saved'
);

update public.offers set title = 'Hijacked'
where id = 'b0000000-0000-0000-0000-000000000001';

select is(
  (select title from public.offers where id = 'b0000000-0000-0000-0000-000000000001'),
  'Live B',
  'a member can''t edit another company''s offer'
);

-- A live offer, on purpose: it stays publicly visible after the move, so only the update
-- policy's `with check` can stop it. (A moved draft would also be blocked by Postgres
-- checking the new row against the select policies, which would hide a missing check.)
select throws_ok(
  $$ update public.offers set company_id = 'b0000000-0000-0000-0000-000000000000'
     where id = 'a0000000-0000-0000-0000-000000000001' $$,
  '42501', null, 'a member can''t move an offer to another company'
);

select lives_ok(
  $$ insert into public.offers (company_id, category_id, slug, title, seniority, workplace, apply_url)
     values ('a0000000-0000-0000-0000-000000000000', 'c0000000-0000-0000-0000-000000000001',
             'a-new', 'New A', 'junior', 'hybrid', 'https://a.example.test/apply') $$,
  'a member can create offers for their company'
);

select throws_ok(
  $$ insert into public.offers (company_id, category_id, slug, title, seniority, workplace, apply_url)
     values ('b0000000-0000-0000-0000-000000000000', 'c0000000-0000-0000-0000-000000000001',
             'b-new', 'New B', 'junior', 'hybrid', 'https://b.example.test/apply') $$,
  '42501', null, 'a member can''t create offers for another company'
);

select lives_ok(
  $$ insert into public.offer_salaries (offer_id, employment_type, min_amount, max_amount)
     values ('a0000000-0000-0000-0000-000000000002', 'permanent', 16000, 20000) $$,
  'a member can add salaries to their company''s offers'
);

select throws_ok(
  $$ insert into public.offer_salaries (offer_id, employment_type, min_amount, max_amount)
     values ('b0000000-0000-0000-0000-000000000001', 'permanent', 1, 2) $$,
  '42501', null, 'a member can''t add salaries to another company''s offer'
);

select lives_ok(
  $$ update public.companies set name = 'Company A Renamed'
     where id = 'a0000000-0000-0000-0000-000000000000' $$,
  'a member can edit their company''s profile'
);

select throws_ok(
  $$ update public.companies set slug = 'company-a-renamed'
     where id = 'a0000000-0000-0000-0000-000000000000' $$,
  '42501', null, 'a member can''t change their company''s slug'
);

reset role;

select * from finish();

rollback;
