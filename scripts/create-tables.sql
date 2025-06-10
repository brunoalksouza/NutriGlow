-- @env DATABASE_URL,POSTGRES_URL_NON_POOLING

-- Create profiles table
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  age int,
  height_cm int,
  weight_kg int,
  goal text,
  activity text,
  restrictions text,
  created_at timestamp default now()
);

-- Create diets table
create table if not exists diets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  plan jsonb,          -- full diet plan response
  created_at timestamp default now()
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table diets enable row level security;

-- Create policies for profiles table
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Create policies for diets table
create policy "Users can view own diets" on diets
  for select using (auth.uid() = user_id);

create policy "Users can insert own diets" on diets
  for insert with check (auth.uid() = user_id);

create policy "Users can update own diets" on diets
  for update using (auth.uid() = user_id);
