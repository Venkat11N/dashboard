create table roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  create_at timestamptz default now()
);

insert into roles (name) values
('SEAFARER'),
('ORGANIZATION_USER'),
('ADMIN')


create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  indos_number text unique,
  cdc_number text unique,
  first_name text not null,
  last_name text not null,
  date_of_birth date,
  email text not null,
  mobile text not null,
  created_at timestamptz default now()
);


create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  role_id uuid references roles(id),
  created_at timestamptz default now(),
  unique (user_id, role_id)
);


create table grievance_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);


create table grievance_subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references grievance_categories(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);


create table grievances (
  id uuid primary key default gen_random_uuid(),
  reference_number text unique not null,
  user_id uuid references auth.users(id) on delete cascade,
  category_id uuid references grievance_categories(id),
  subcategory_id uuid references grievance_subcategories(id),
  subject text not null,
  description text not null,
  status text not null default 'PENDING',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


create table grievance_files (
  id uuid primary key default gen_random_uuid(),
  grievance_id uuid references grievances(id) on delete cascade,
  file_url text not null,
  uploaded_at timestamptz default now()
);


create table grievance_public_links (
  id uuid primary key default gen_random_uuid(),
  grievance_id uuid references grievances(id) on delete cascade,
  token_hash text unique not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table grievances enable row level security;
alter table grievance_files enable row level security;

create policy "Read own profile"
on profiles
for select
using (id = auth.uid());

create policy "Read own grievances"
on grievances
for select
using (user_id = auth.uid());

create policy "Create grievance"
on grievances
for insert
with check (user_id = auth.uid());


create policy "Admin full access"
on grievances
for all
using (
  exists (
    select 1
    from user_roles ur
    join roles r on ur.role_id = r.id
    where ur.user_id = auth.uid()
      and r.name = 'ADMIN'
  )
);
