-- Margin request trail: designer submits margin, admin approves/rejects with comment.
-- One row per submission so full history is kept.
create table if not exists margin_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references firm_profiles(id) on delete cascade,
  requested_margin_pct numeric not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  admin_comment text,
  admin_set_margin_pct numeric,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references users(id) on delete set null
);

create index if not exists margin_requests_profile_idx on margin_requests(profile_id);
create index if not exists margin_requests_status_idx on margin_requests(status);
create index if not exists margin_requests_created_idx on margin_requests(created_at desc);
