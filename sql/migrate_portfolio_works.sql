-- Portfolio works: up to 3 works per firm, each with title, description, and up to 3 images

create table if not exists firm_portfolio_works (
  id uuid primary key,
  profile_id uuid not null references firm_profiles(id) on delete cascade,
  title text not null,
  description text,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists firm_portfolio_works_profile_idx on firm_portfolio_works(profile_id);

alter table firm_portfolio_files
  add column if not exists work_id uuid references firm_portfolio_works(id) on delete set null;

create index if not exists firm_portfolio_files_work_idx on firm_portfolio_files(work_id);
