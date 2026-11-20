-- Local development data: fictional companies and job offers, so pages have something
-- to show. Runs automatically after the migrations on `npm run db:reset`. All companies
-- are made up, and their sites use the reserved .example domain.
--
-- Offers are listed one per row in a staging table below, so they're easy to read and
-- edit; the statements after it turn them into rows of the real tables. Dates are relative
-- to now(), so the offers are live whenever the seed runs.

-- Lookups ----------------------------------------------------------------------------------

insert into public.categories (slug, name) values
  ('frontend', 'Frontend'),
  ('backend', 'Backend'),
  ('fullstack', 'Fullstack'),
  ('mobile', 'Mobile'),
  ('devops', 'DevOps'),
  ('data', 'Data'),
  ('qa', 'QA'),
  ('security', 'Security');

insert into public.cities (slug, name) values
  ('warszawa', 'Warszawa'),
  ('krakow', 'Kraków'),
  ('wroclaw', 'Wrocław'),
  ('gdansk', 'Gdańsk'),
  ('poznan', 'Poznań'),
  ('lodz', 'Łódź'),
  ('katowice', 'Katowice'),
  ('lublin', 'Lublin');

insert into public.skills (slug, name) values
  ('react', 'React'),
  ('typescript', 'TypeScript'),
  ('nextjs', 'Next.js'),
  ('playwright', 'Playwright'),
  ('graphql', 'GraphQL'),
  ('storybook', 'Storybook'),
  ('tailwind-css', 'Tailwind CSS'),
  ('angular', 'Angular'),
  ('rxjs', 'RxJS'),
  ('nx', 'Nx'),
  ('vue', 'Vue.js'),
  ('nuxt', 'Nuxt'),
  ('figma', 'Figma'),
  ('java', 'Java'),
  ('spring', 'Spring'),
  ('postgresql', 'PostgreSQL'),
  ('kafka', 'Kafka'),
  ('docker', 'Docker'),
  ('go', 'Go'),
  ('kubernetes', 'Kubernetes'),
  ('grpc', 'gRPC'),
  ('python', 'Python'),
  ('django', 'Django'),
  ('celery', 'Celery'),
  ('nodejs', 'Node.js'),
  ('redis', 'Redis'),
  ('aws', 'AWS'),
  ('c-sharp', 'C#'),
  ('dotnet', '.NET'),
  ('sql', 'SQL'),
  ('azure', 'Azure'),
  ('php', 'PHP'),
  ('laravel', 'Laravel'),
  ('mysql', 'MySQL'),
  ('kotlin', 'Kotlin'),
  ('swift', 'Swift'),
  ('swiftui', 'SwiftUI'),
  ('combine', 'Combine'),
  ('jetpack-compose', 'Jetpack Compose'),
  ('coroutines', 'Kotlin Coroutines'),
  ('flutter', 'Flutter'),
  ('dart', 'Dart'),
  ('firebase', 'Firebase'),
  ('react-native', 'React Native'),
  ('expo', 'Expo'),
  ('terraform', 'Terraform'),
  ('argo-cd', 'Argo CD'),
  ('prometheus', 'Prometheus'),
  ('linux', 'Linux'),
  ('spark', 'Apache Spark'),
  ('airflow', 'Apache Airflow'),
  ('power-bi', 'Power BI'),
  ('pytorch', 'PyTorch'),
  ('cypress', 'Cypress'),
  ('selenium', 'Selenium'),
  ('jenkins', 'Jenkins'),
  ('owasp', 'OWASP'),
  ('burp-suite', 'Burp Suite');

-- Companies --------------------------------------------------------------------------------

insert into public.companies (slug, name, website, description) values
  ('pixelforge', 'Pixelforge', 'https://pixelforge.example',
   'Product studio building web and mobile apps for European startups.'),
  ('bitlane', 'Bitlane', 'https://bitlane.example',
   'Logistics software that plans routes for 4,000 delivery vans every morning.'),
  ('cloudberry-labs', 'Cloudberry Labs', 'https://cloudberry.example',
   'Developer tools company: we build the CI platform other engineering teams rely on.'),
  ('kodama-systems', 'Kodama Systems', 'https://kodama.example',
   'Energy management software for factories and office buildings.'),
  ('amberstack', 'Amberstack', 'https://amberstack.example',
   'E-commerce platform powering online shops across Central Europe.'),
  ('brightwave-health', 'Brightwave Health', 'https://brightwave.example',
   'Telemedicine apps connecting patients with doctors in minutes.'),
  ('orbitdesk', 'Orbitdesk', 'https://orbitdesk.example',
   'Customer support software with a shared inbox, chat and help center.'),
  ('tidal-data', 'Tidal Data', 'https://tidaldata.example',
   'Data platform company helping retailers forecast demand.'),
  ('quantum-pierogi', 'Quantum Pierogi', 'https://quantumpierogi.example',
   'Food delivery app with a soft spot for dumplings and a hard one for latency.'),
  ('vistula-pay', 'Vistula Pay', 'https://vistulapay.example',
   'Payments infrastructure for marketplaces and subscription businesses.');

-- A placeholder logo for every company until there are real ones: a file in public/,
-- so the path works as an image src as it is.
update public.companies set logo_path = '/icons/google.svg';

-- Offers -----------------------------------------------------------------------------------
-- skills: 'slug:level' is required, '~slug:level' is nice to have (level 1–5).
-- salaries: JSON list; currency defaults to PLN and period to month.
-- days_ago: when the offer was published. Offers expire 30 days later, so the two with
-- 40+ days are already expired, and the two drafts are never public.

create temporary table seed_offers (
  n integer generated always as identity,
  company text not null,
  category text not null,
  slug text not null,
  title text not null,
  seniority public.seniority not null,
  workplace public.workplace not null,
  status public.offer_status not null,
  days_ago integer not null,
  cities text[] not null,
  skills text[] not null,
  salaries jsonb not null
);

insert into seed_offers
  (company, category, slug, title, seniority, workplace, status, days_ago, cities, skills, salaries)
values
  ('quantum-pierogi', 'frontend', 'quantum-pierogi-frontend-developer', 'Frontend Developer', 'mid', 'remote', 'published', 22,
   '{}'::text[],
   array['react:4', 'typescript:2', '~nextjs:1', '~playwright:1']::text[],
   '[{"type":"b2b","min":15000,"max":21000}]'),
  ('bitlane', 'frontend', 'bitlane-react-developer', 'React Developer', 'mid', 'remote', 'published', 26,
   '{}'::text[],
   array['react:3', 'typescript:3', '~graphql:1', '~storybook:1']::text[],
   '[{"type":"b2b","min":16500,"max":21500},{"type":"permanent","min":13000,"max":17000}]'),
  ('brightwave-health', 'frontend', 'brightwave-health-next-js-developer', 'Next.js Developer', 'mid', 'remote', 'published', 20,
   '{}'::text[],
   array['nextjs:3', 'react:3', 'typescript:3', '~tailwind-css:1']::text[],
   '[{"type":"b2b","min":95,"max":130,"period":"hour"}]'),
  ('cloudberry-labs', 'frontend', 'cloudberry-labs-angular-developer', 'Angular Developer', 'mid', 'hybrid', 'published', 24,
   array['wroclaw']::text[],
   array['angular:4', 'typescript:4', 'rxjs:3', '~nx:1']::text[],
   '[{"type":"b2b","min":16500,"max":20500}]'),
  ('pixelforge', 'frontend', 'pixelforge-junior-vue-js-developer', 'Junior Vue.js Developer', 'junior', 'remote', 'published', 6,
   '{}'::text[],
   array['vue:1', 'typescript:2', '~nuxt:1']::text[],
   '[{"type":"b2b","min":8000,"max":10000},{"type":"permanent","min":6500,"max":8000}]'),
  ('tidal-data', 'frontend', 'tidal-data-lead-frontend-engineer-design-systems', 'Lead Frontend Engineer (Design Systems)', 'lead', 'remote', 'draft', 23,
   '{}'::text[],
   array['react:5', 'typescript:5', 'storybook:5', '~figma:3']::text[],
   '[{"type":"b2b","min":6000,"max":8000,"currency":"EUR"}]'),
  ('vistula-pay', 'backend', 'vistula-pay-senior-java-developer', 'Senior Java Developer', 'senior', 'hybrid', 'published', 13,
   array['katowice', 'wroclaw']::text[],
   array['java:4', 'spring:4', 'postgresql:5', '~kafka:2', '~docker:2']::text[],
   '[{"type":"b2b","min":20500,"max":24500}]'),
  ('vistula-pay', 'backend', 'vistula-pay-go-developer', 'Go Developer', 'mid', 'remote', 'published', 21,
   '{}'::text[],
   array['go:4', 'postgresql:4', '~kubernetes:1', '~grpc:1']::text[],
   '[{"type":"b2b","min":15000,"max":22000},{"type":"permanent","min":12000,"max":17500}]'),
  ('quantum-pierogi', 'backend', 'quantum-pierogi-senior-python-developer', 'Senior Python Developer', 'senior', 'hybrid', 'published', 5,
   array['lodz', 'warszawa']::text[],
   array['python:4', 'django:5', 'postgresql:4', '~celery:2']::text[],
   '[{"type":"b2b","min":22000,"max":29500},{"type":"permanent","min":17500,"max":23500}]'),
  ('quantum-pierogi', 'backend', 'quantum-pierogi-node-js-developer', 'Node.js Developer', 'mid', 'office', 'published', 10,
   array['poznan', 'katowice']::text[],
   array['nodejs:3', 'typescript:3', 'postgresql:3', '~redis:1', '~aws:1']::text[],
   '[{"type":"b2b","min":15500,"max":20000},{"type":"permanent","min":12500,"max":16000},{"type":"mandate","min":13000,"max":17000}]'),
  ('tidal-data', 'backend', 'tidal-data-senior-dotnet-developer', 'Senior .NET Developer', 'senior', 'remote', 'published', 24,
   '{}'::text[],
   array['c-sharp:4', 'dotnet:4', 'sql:4', '~azure:2']::text[],
   '[{"type":"b2b","min":20000,"max":29500},{"type":"permanent","min":16000,"max":23500},{"type":"mandate","min":17000,"max":25000}]'),
  ('quantum-pierogi', 'backend', 'quantum-pierogi-php-developer', 'PHP Developer', 'mid', 'hybrid', 'published', 40,
   array['lublin']::text[],
   array['php:3', 'laravel:3', 'mysql:4', '~redis:1']::text[],
   '[{"type":"b2b","min":16500,"max":22000}]'),
  ('brightwave-health', 'backend', 'brightwave-health-kotlin-backend-engineer', 'Kotlin Backend Engineer', 'mid', 'hybrid', 'published', 20,
   array['lublin', 'warszawa']::text[],
   array['kotlin:3', 'spring:3', 'postgresql:2', '~kafka:1']::text[],
   '[{"type":"b2b","min":14000,"max":19500},{"type":"permanent","min":11000,"max":15500},{"type":"mandate","min":12000,"max":16500}]'),
  ('pixelforge', 'fullstack', 'pixelforge-junior-fullstack-developer-react-node-js', 'Junior Fullstack Developer (React + Node.js)', 'junior', 'remote', 'published', 18,
   '{}'::text[],
   array['react:1', 'nodejs:2', 'typescript:1', '~postgresql:1']::text[],
   '[{"type":"b2b","min":8000,"max":11000},{"type":"permanent","min":6500,"max":9000}]'),
  ('vistula-pay', 'fullstack', 'vistula-pay-senior-fullstack-engineer-typescript', 'Senior Fullstack Engineer (TypeScript)', 'senior', 'hybrid', 'published', 20,
   array['katowice']::text[],
   array['typescript:4', 'nextjs:3', 'postgresql:3', '~aws:2']::text[],
   '[{"type":"b2b","min":22500,"max":26500},{"type":"mandate","min":19000,"max":22500}]'),
  ('bitlane', 'fullstack', 'bitlane-senior-fullstack-developer-java-angular', 'Senior Fullstack Developer (Java + Angular)', 'senior', 'remote', 'published', 27,
   '{}'::text[],
   array['java:4', 'angular:3', 'spring:4', '~docker:2']::text[],
   '[{"type":"b2b","min":21000,"max":27000},{"type":"permanent","min":17000,"max":21500}]'),
  ('bitlane', 'mobile', 'bitlane-ios-developer', 'iOS Developer', 'mid', 'hybrid', 'published', 12,
   array['krakow', 'warszawa']::text[],
   array['swift:2', 'swiftui:2', '~combine:1']::text[],
   '[{"type":"b2b","min":16000,"max":21500},{"type":"permanent","min":13000,"max":17000}]'),
  ('pixelforge', 'mobile', 'pixelforge-android-developer', 'Android Developer', 'mid', 'remote', 'draft', 25,
   '{}'::text[],
   array['kotlin:2', 'jetpack-compose:4', '~coroutines:1']::text[],
   '[{"type":"b2b","min":14000,"max":21000},{"type":"permanent","min":11000,"max":17000}]'),
  ('quantum-pierogi', 'mobile', 'quantum-pierogi-senior-flutter-developer', 'Senior Flutter Developer', 'senior', 'hybrid', 'published', 1,
   array['wroclaw']::text[],
   array['flutter:4', 'dart:4', '~firebase:2']::text[],
   '[{"type":"b2b","min":21000,"max":24500},{"type":"permanent","min":17000,"max":19500}]'),
  ('vistula-pay', 'mobile', 'vistula-pay-junior-react-native-developer', 'Junior React Native Developer', 'junior', 'hybrid', 'published', 18,
   array['wroclaw', 'warszawa']::text[],
   array['react-native:1', 'typescript:2', '~expo:1']::text[],
   '[{"type":"b2b","min":7000,"max":9500},{"type":"permanent","min":5500,"max":7500}]'),
  ('kodama-systems', 'devops', 'kodama-systems-lead-devops-engineer', 'Lead DevOps Engineer', 'lead', 'hybrid', 'published', 9,
   array['krakow']::text[],
   array['kubernetes:5', 'terraform:5', 'aws:5', '~argo-cd:3']::text[],
   '[{"type":"b2b","min":26000,"max":34000},{"type":"permanent","min":21000,"max":27000}]'),
  ('tidal-data', 'devops', 'tidal-data-platform-engineer', 'Platform Engineer', 'mid', 'remote', 'published', 17,
   '{}'::text[],
   array['kubernetes:2', 'go:2', 'terraform:4', '~prometheus:1']::text[],
   '[{"type":"b2b","min":3500,"max":4500,"currency":"EUR"}]'),
  ('kodama-systems', 'devops', 'kodama-systems-senior-site-reliability-engineer', 'Senior Site Reliability Engineer', 'senior', 'hybrid', 'published', 25,
   array['lodz']::text[],
   array['linux:3', 'kubernetes:4', 'prometheus:4', '~go:2']::text[],
   '[{"type":"b2b","min":21000,"max":26500},{"type":"permanent","min":17000,"max":21000}]'),
  ('quantum-pierogi', 'devops', 'quantum-pierogi-cloud-engineer-azure-intern', 'Cloud Engineer Intern (Azure)', 'intern', 'remote', 'published', 3,
   '{}'::text[],
   array['azure:2', 'terraform:1', '~dotnet:1']::text[],
   '[{"type":"permanent","min":5000,"max":7000}]'),
  ('bitlane', 'data', 'bitlane-senior-data-engineer', 'Senior Data Engineer', 'senior', 'hybrid', 'published', 27,
   array['poznan']::text[],
   array['python:4', 'sql:4', 'spark:4', '~airflow:2', '~aws:2']::text[],
   '[{"type":"b2b","min":21000,"max":28000},{"type":"permanent","min":17000,"max":22500}]'),
  ('pixelforge', 'data', 'pixelforge-senior-data-analyst', 'Senior Data Analyst', 'senior', 'remote', 'published', 14,
   '{}'::text[],
   array['sql:5', 'python:4', '~power-bi:2']::text[],
   '[{"type":"b2b","min":20000,"max":26000}]'),
  ('quantum-pierogi', 'data', 'quantum-pierogi-senior-machine-learning-engineer', 'Senior Machine Learning Engineer', 'senior', 'hybrid', 'published', 9,
   array['warszawa', 'lublin']::text[],
   array['python:3', 'pytorch:4', '~kubernetes:2']::text[],
   '[{"type":"b2b","min":22000,"max":29000},{"type":"permanent","min":17500,"max":23000}]'),
  ('brightwave-health', 'qa', 'brightwave-health-qa-automation-engineer', 'QA Automation Engineer', 'mid', 'office', 'published', 23,
   array['lodz']::text[],
   array['playwright:3', 'typescript:3', '~cypress:1']::text[],
   '[{"type":"b2b","min":15500,"max":19000}]'),
  ('cloudberry-labs', 'qa', 'cloudberry-labs-test-engineer-java', 'Test Engineer (Java)', 'mid', 'office', 'published', 27,
   array['wroclaw']::text[],
   array['java:3', 'selenium:4', '~jenkins:1']::text[],
   '[{"type":"b2b","min":13000,"max":20500}]'),
  ('kodama-systems', 'security', 'kodama-systems-lead-security-engineer', 'Lead Security Engineer', 'lead', 'remote', 'published', 52,
   '{}'::text[],
   array['linux:4', 'aws:5', '~kubernetes:3']::text[],
   '[{"type":"b2b","min":29000,"max":35500}]'),
  ('kodama-systems', 'security', 'kodama-systems-lead-application-security-engineer', 'Lead Application Security Engineer', 'lead', 'remote', 'published', 12,
   '{}'::text[],
   array['owasp:5', 'python:5', '~burp-suite:3']::text[],
   '[{"type":"b2b","min":26500,"max":35000},{"type":"permanent","min":21000,"max":28000}]'),
  ('quantum-pierogi', 'devops', 'quantum-pierogi-senior-platform-engineer', 'Senior Platform Engineer', 'senior', 'remote', 'published', 23,
   '{}'::text[],
   array['kubernetes:3', 'go:3', 'terraform:4', '~prometheus:2']::text[],
   '[{"type":"b2b","min":20500,"max":30000},{"type":"permanent","min":16500,"max":24000}]'),
  ('brightwave-health', 'data', 'brightwave-health-senior-data-analyst', 'Senior Data Analyst', 'senior', 'hybrid', 'published', 23,
   array['krakow', 'gdansk']::text[],
   array['sql:4', 'python:4', '~power-bi:2']::text[],
   '[{"type":"b2b","min":20000,"max":26500}]'),
  ('kodama-systems', 'devops', 'kodama-systems-lead-cloud-engineer-azure', 'Lead Cloud Engineer (Azure)', 'lead', 'remote', 'published', 21,
   '{}'::text[],
   array['azure:4', 'terraform:5', '~dotnet:3']::text[],
   '[{"type":"b2b","min":28000,"max":34000}]'),
  ('brightwave-health', 'fullstack', 'brightwave-health-fullstack-developer-react-node-js', 'Fullstack Developer (React + Node.js)', 'mid', 'hybrid', 'published', 0,
   array['wroclaw']::text[],
   array['react:3', 'nodejs:4', 'typescript:4', '~postgresql:1']::text[],
   '[{"type":"b2b","min":15500,"max":21500},{"type":"permanent","min":12500,"max":17000}]'),
  ('amberstack', 'backend', 'amberstack-node-js-developer-intern', 'Node.js Developer Intern', 'intern', 'remote', 'published', 15,
   '{}'::text[],
   array['nodejs:2', 'typescript:3', 'postgresql:3', '~redis:1', '~aws:1']::text[],
   '[{"type":"permanent","min":4500,"max":7000}]'),
  ('cloudberry-labs', 'data', 'cloudberry-labs-data-analyst-intern', 'Data Analyst Intern', 'intern', 'hybrid', 'published', 6,
   array['lodz']::text[],
   array['sql:1', 'python:2', '~power-bi:1']::text[],
   '[{"type":"permanent","min":4500,"max":7000}]'),
  ('pixelforge', 'frontend', 'pixelforge-junior-vue-js-developer-2', 'Junior Vue.js Developer', 'junior', 'remote', 'published', 12,
   '{}'::text[],
   array['vue:3', 'typescript:1', '~nuxt:1']::text[],
   '[{"type":"b2b","min":8000,"max":12500}]'),
  ('cloudberry-labs', 'backend', 'cloudberry-labs-senior-go-developer', 'Senior Go Developer', 'senior', 'hybrid', 'published', 27,
   array['krakow']::text[],
   array['go:5', 'postgresql:4', '~kubernetes:2', '~grpc:2']::text[],
   '[{"type":"b2b","min":20500,"max":29500},{"type":"permanent","min":16500,"max":23500}]'),
  ('tidal-data', 'frontend', 'tidal-data-senior-angular-developer', 'Senior Angular Developer', 'senior', 'remote', 'published', 26,
   '{}'::text[],
   array['angular:5', 'typescript:4', 'rxjs:5', '~nx:2']::text[],
   '[{"type":"b2b","min":5000,"max":6500,"currency":"EUR"}]'),
  ('quantum-pierogi', 'security', 'quantum-pierogi-junior-security-engineer', 'Junior Security Engineer', 'junior', 'hybrid', 'published', 7,
   array['lublin']::text[],
   array['linux:3', 'aws:2', '~kubernetes:1']::text[],
   '[{"type":"b2b","min":8500,"max":12500}]'),
  ('tidal-data', 'backend', 'tidal-data-senior-python-developer', 'Senior Python Developer', 'senior', 'remote', 'published', 4,
   '{}'::text[],
   array['python:4', 'django:4', 'postgresql:4', '~celery:2']::text[],
   '[{"type":"b2b","min":5000,"max":7000,"currency":"EUR"}]'),
  ('orbitdesk', 'backend', 'orbitdesk-junior-go-developer', 'Junior Go Developer', 'junior', 'hybrid', 'published', 26,
   array['gdansk', 'warszawa']::text[],
   array['go:3', 'postgresql:3', '~kubernetes:1', '~grpc:1']::text[],
   '[{"type":"b2b","min":45,"max":70,"period":"hour"}]'),
  ('orbitdesk', 'fullstack', 'orbitdesk-fullstack-developer-react-node-js', 'Fullstack Developer (React + Node.js)', 'mid', 'office', 'published', 17,
   array['warszawa', 'katowice']::text[],
   array['react:4', 'nodejs:4', 'typescript:2', '~postgresql:1']::text[],
   '[{"type":"b2b","min":16500,"max":19500}]'),
  ('quantum-pierogi', 'devops', 'quantum-pierogi-cloud-engineer-azure', 'Cloud Engineer (Azure)', 'mid', 'hybrid', 'published', 5,
   array['lublin']::text[],
   array['azure:3', 'terraform:3', '~dotnet:1']::text[],
   '[{"type":"b2b","min":14500,"max":16500}]'),
  ('tidal-data', 'data', 'tidal-data-machine-learning-engineer', 'Machine Learning Engineer', 'mid', 'office', 'published', 6,
   array['warszawa', 'gdansk']::text[],
   array['python:2', 'pytorch:2', '~kubernetes:1']::text[],
   '[{"type":"b2b","min":15000,"max":17500},{"type":"permanent","min":12000,"max":14000}]'),
  ('brightwave-health', 'fullstack', 'brightwave-health-fullstack-engineer-typescript', 'Fullstack Engineer (TypeScript)', 'mid', 'remote', 'published', 17,
   '{}'::text[],
   array['typescript:4', 'nextjs:3', 'postgresql:4', '~aws:1']::text[],
   '[{"type":"b2b","min":90,"max":105,"period":"hour"}]'),
  ('brightwave-health', 'frontend', 'brightwave-health-junior-react-developer', 'Junior React Developer', 'junior', 'remote', 'published', 4,
   '{}'::text[],
   array['react:1', 'typescript:1', '~graphql:1', '~storybook:1']::text[],
   '[{"type":"b2b","min":8500,"max":13000},{"type":"permanent","min":7000,"max":10500}]'),
  ('bitlane', 'fullstack', 'bitlane-junior-fullstack-developer-java-angular', 'Junior Fullstack Developer (Java + Angular)', 'junior', 'hybrid', 'published', 9,
   array['lublin']::text[],
   array['java:2', 'angular:2', 'spring:2', '~docker:1']::text[],
   '[{"type":"b2b","min":8000,"max":13000}]'),
  ('vistula-pay', 'frontend', 'vistula-pay-senior-angular-developer', 'Senior Angular Developer', 'senior', 'remote', 'published', 22,
   '{}'::text[],
   array['angular:4', 'typescript:5', 'rxjs:5', '~nx:2']::text[],
   '[{"type":"b2b","min":24000,"max":27000}]');

-- A typo in a slug above would otherwise drop rows silently in the joins below.
do $$
declare
  missing text;
begin
  select string_agg(distinct x.slug, ', ') into missing
  from (
    select ltrim(split_part(skill, ':', 1), '~') as slug from seed_offers, unnest(skills) skill
  ) x
  where not exists (select 1 from public.skills s where s.slug = x.slug);
  if missing is not null then raise exception 'seed: unknown skills: %', missing; end if;

  select string_agg(distinct city, ', ') into missing
  from seed_offers, unnest(cities) city
  where not exists (select 1 from public.cities c where c.slug = city);
  if missing is not null then raise exception 'seed: unknown cities: %', missing; end if;
end;
$$;

insert into public.offers
  (company_id, category_id, slug, title, description, seniority, workplace, apply_url,
   status, published_at, expires_at)
select
  c.id,
  cat.id,
  o.slug,
  o.title,
  format(
    E'## About the role\n\n%s is hiring a %s. %s\n\n'
    || E'## What you will work with\n\n%s\n\n'
    || E'## What we offer\n\n- Flexible hours and a %s setup\n'
    || E'- Private healthcare and a sports card\n- A yearly budget for conferences and courses',
    c.name,
    o.title,
    c.description,
    (
      select string_agg('- ' || s.name, E'\n' order by ord)
      from unnest(o.skills) with ordinality as k(skill, ord)
      join public.skills s on s.slug = ltrim(split_part(k.skill, ':', 1), '~')
    ),
    o.workplace
  ),
  o.seniority,
  o.workplace,
  'https://' || substring(c.website from 'https://(.*)') || '/careers/' || o.slug,
  o.status,
  published.at,
  published.at + interval '30 days'
from seed_offers o
join public.companies c on c.slug = o.company
join public.categories cat on cat.slug = o.category
-- Minutes apart, so no two offers share a timestamp.
cross join lateral (
  select case when o.status = 'draft' then null
    else now() - make_interval(days => o.days_ago, mins => o.n) end as at
) published;

insert into public.offer_locations (offer_id, city_id)
select offer.id, city.id
from seed_offers o
join public.offers offer on offer.slug = o.slug
cross join unnest(o.cities) as l(slug)
join public.cities city on city.slug = l.slug;

insert into public.offer_skills (offer_id, skill_id, level, required)
select
  offer.id,
  skill.id,
  split_part(k.skill, ':', 2)::smallint,
  not starts_with(k.skill, '~')
from seed_offers o
join public.offers offer on offer.slug = o.slug
cross join unnest(o.skills) as k(skill)
join public.skills skill on skill.slug = ltrim(split_part(k.skill, ':', 1), '~');

insert into public.offer_salaries
  (offer_id, employment_type, min_amount, max_amount, currency, period)
select
  offer.id,
  (s ->> 'type')::public.employment_type,
  (s ->> 'min')::integer,
  (s ->> 'max')::integer,
  coalesce(s ->> 'currency', 'PLN'),
  coalesce(s ->> 'period', 'month')::public.salary_period
from seed_offers o
join public.offers offer on offer.slug = o.slug
cross join jsonb_array_elements(o.salaries) as s;

drop table seed_offers;
