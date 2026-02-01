-- Interior OS schema for Neon (PostgreSQL) - refactored

drop table if exists notifications cascade;
drop table if exists city_pincode_rates cascade;
drop table if exists marketing_links cascade;
drop table if exists social_links cascade;
drop table if exists admin_settings cascade;
drop table if exists digital_twin_subscriptions cascade;
drop table if exists digital_twin_files cascade;
drop table if exists payment_ledger cascade;
drop table if exists milestone_images cascade;
drop table if exists milestone_comments cascade;
drop table if exists milestones cascade;
drop table if exists projects cascade;
drop table if exists firm_documents cascade;
drop table if exists firm_portfolio_files cascade;
drop table if exists firm_profiles cascade;
drop table if exists email_otps cascade;
drop table if exists sessions cascade;
drop table if exists users cascade;

drop type if exists subscription_status;
drop type if exists digital_twin_category;
drop type if exists notification_type;
drop type if exists payment_type;
drop type if exists payment_status;
drop type if exists milestone_status;
drop type if exists project_status;
drop type if exists firm_status;
drop type if exists role;

create type role as enum ('CUSTOMER', 'FIRM', 'ADMIN');
create type firm_status as enum ('PENDING', 'APPROVED', 'REJECTED');
create type project_status as enum ('REQUESTED', 'ACCEPTED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'CANCELLED');
create type milestone_status as enum ('PENDING', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'DISPUTED');
create type payment_status as enum ('PENDING', 'HELD', 'RELEASED', 'CANCELLED');
create type payment_type as enum ('ADVANCE', 'MILESTONE', 'DIGITAL_TWIN_RENEWAL', 'FIRM_YEARLY_FEE', 'CUSTOMER_REGISTRATION_FEE', 'FIRM_REGISTRATION_FEE');
create type notification_type as enum (
  'FIRM_APPROVED',
  'PROJECT_REQUEST',
  'MILESTONE_SUBMITTED',
  'MILESTONE_APPROVED',
  'PAYMENT_RELEASED',
  'MILESTONE_DISPUTED'
);
create type digital_twin_category as enum ('WIRING', 'PLUMBING', 'FLOOR_PLAN', 'HANDOVER', 'OTHER');
create type subscription_status as enum ('ACTIVE', 'EXPIRED');

create table users (
  id uuid primary key,
  email text unique not null,
  phone text unique,
  alt_phone text,
  password_hash text not null,
  role role not null default 'CUSTOMER',
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table sessions (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  token_hash text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table email_otps (
  id uuid primary key,
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table firm_profiles (
  id uuid primary key,
  user_id uuid unique not null references users(id) on delete cascade,
  firm_name text not null,
  owner_name text not null,
  office_address text not null,
  gst text,
  business_type text,
  ticket_size text,
  designers_count int,
  comments text,
  rating numeric(2,1),
  name text,
  experience_years int,
  city text not null,
  pincode text not null,
  about text not null,
  status firm_status not null default 'PENDING',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table firm_documents (
  id uuid primary key,
  profile_id uuid not null references firm_profiles(id) on delete cascade,
  doc_type text not null,
  blob_url text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes int not null,
  created_at timestamptz not null default now()
);

create table firm_portfolio_files (
  id uuid primary key,
  profile_id uuid not null references firm_profiles(id) on delete cascade,
  blob_url text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes int not null,
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key,
  customer_id uuid not null references users(id) on delete cascade,
  firm_id uuid references users(id) on delete set null,
  status project_status not null default 'REQUESTED',
  title text not null,
  description text,
  property_type text,
  carpet_area int,
  rooms int,
  budget_range text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table milestones (
  id uuid primary key,
  project_id uuid not null references projects(id) on delete cascade,
  phase text,
  title text not null,
  description text not null,
  amount int not null,
  status milestone_status not null default 'PENDING',
  expected_duration text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table milestone_images (
  id uuid primary key,
  milestone_id uuid not null references milestones(id) on delete cascade,
  blob_url text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes int not null,
  created_at timestamptz not null default now()
);

create table milestone_comments (
  id uuid primary key,
  milestone_id uuid not null references milestones(id) on delete cascade,
  author_id uuid not null references users(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create table payment_ledger (
  id uuid primary key,
  type payment_type not null,
  status payment_status not null default 'PENDING',
  amount int not null,
  currency text not null default 'INR',
  customer_id uuid references users(id) on delete set null,
  firm_id uuid references users(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  milestone_id uuid references milestones(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table digital_twin_files (
  id uuid primary key,
  customer_id uuid not null references users(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  category digital_twin_category not null default 'OTHER',
  blob_url text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes int not null,
  uploaded_by uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table digital_twin_subscriptions (
  id uuid primary key,
  customer_id uuid unique not null references users(id) on delete cascade,
  status subscription_status not null default 'ACTIVE',
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_charged_at timestamptz
);

create table admin_settings (
  id uuid primary key,
  otp_enabled boolean not null default false,
  customer_registration_fee int not null default 0,
  firm_yearly_fee int not null default 0,
  digital_twin_yearly_fee int not null default 1000,
  smtp_host text,
  smtp_port int,
  smtp_user text,
  smtp_pass text,
  smtp_secure boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table social_links (
  id uuid primary key,
  settings_id uuid not null references admin_settings(id) on delete cascade,
  platform text not null,
  url text not null,
  show_in_header boolean not null default true,
  show_in_footer boolean not null default true,
  show_in_landing boolean not null default true,
  created_at timestamptz not null default now()
);

create table marketing_links (
  id uuid primary key,
  settings_id uuid not null references admin_settings(id) on delete cascade,
  label text not null,
  url text not null,
  show_in_header boolean not null default true,
  show_in_footer boolean not null default true,
  show_in_landing boolean not null default true,
  created_at timestamptz not null default now()
);

create table city_pincode_rates (
  id uuid primary key,
  settings_id uuid not null references admin_settings(id) on delete cascade,
  city text not null,
  pincode text not null,
  rate_per_sq_ft int not null,
  rate_per_sq_yd numeric,
  rate_per_sq_m numeric,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  type notification_type not null,
  title text not null,
  message text not null,
  metadata jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index users_role_idx on users(role);
create index users_phone_idx on users(phone);
create index sessions_user_idx on sessions(user_id);
create index sessions_expires_idx on sessions(expires_at);
create index otp_email_idx on email_otps(email);
create index otp_expires_idx on email_otps(expires_at);
create index firm_status_idx on firm_profiles(status);
create index firm_city_idx on firm_profiles(city, pincode);
create index project_customer_idx on projects(customer_id);
create index project_firm_idx on projects(firm_id);
create index project_status_idx on projects(status);
create index milestone_project_idx on milestones(project_id);
create index milestone_status_idx on milestones(status);
create index payment_status_idx on payment_ledger(status);
create index payment_type_idx on payment_ledger(type);
create index payment_project_idx on payment_ledger(project_id);
create index payment_customer_idx on payment_ledger(customer_id);
create index twin_customer_idx on digital_twin_files(customer_id);
create index twin_project_idx on digital_twin_files(project_id);
create index twin_subscription_expires_idx on digital_twin_subscriptions(expires_at);
create index notification_user_idx on notifications(user_id);
create index notification_type_idx on notifications(type);
create index rates_city_idx on city_pincode_rates(city, pincode);
