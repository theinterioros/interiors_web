-- Milestone trail: history of submit / reject / approve for timelines and audit
create table if not exists milestone_trail (
  id uuid primary key,
  milestone_id uuid not null references milestones(id) on delete cascade,
  event text not null,
  actor_id uuid references users(id) on delete set null,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists milestone_trail_milestone_idx on milestone_trail(milestone_id);
create index if not exists milestone_trail_created_idx on milestone_trail(created_at);

comment on table milestone_trail is 'Event log per milestone: SUBMITTED, REJECTED, APPROVED for timelines and audit';
