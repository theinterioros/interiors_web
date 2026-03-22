alter table admin_settings
  add column if not exists estimator_prompt_custom text;

alter table admin_settings
  add column if not exists visualization_prompt_custom text;

alter table admin_settings
  add column if not exists llm_provider text not null default 'OPENAI';

alter table admin_settings
  add column if not exists llm_model text;

alter table admin_settings
  add column if not exists llm_image_model text;

create table if not exists ai_prompt_audit_logs (
  id uuid primary key,
  settings_id uuid not null references admin_settings(id) on delete cascade,
  admin_user_id uuid references users(id) on delete set null,
  prompt_key text not null,
  action text not null,
  previous_value text,
  new_value text,
  created_at timestamptz not null default now()
);

