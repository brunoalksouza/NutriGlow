-- @env DATABASE_URL,POSTGRES_URL_NON_POOLING

-- Create subscriptions table
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text,                 -- trialing, active, past_due, canceled, etc.
  current_period_end timestamp,
  created_at timestamp default now()
);

-- Create unique index to ensure one subscription per user
create unique index if not exists subscriptions_user_idx on subscriptions(user_id);

-- Create index for stripe customer lookups
create index if not exists subscriptions_stripe_customer_idx on subscriptions(stripe_customer_id);

-- Enable Row Level Security
alter table subscriptions enable row level security;

-- Create policies for subscriptions table
create policy "Users can view own subscription" on subscriptions
  for select using (auth.uid() = user_id);

create policy "Users can insert own subscription" on subscriptions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own subscription" on subscriptions
  for update using (auth.uid() = user_id);

-- Create a function to check if user has active subscription
create or replace function has_active_subscription(user_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1 from subscriptions 
    where user_id = user_uuid 
    and status in ('active', 'trialing')
    and (current_period_end is null or current_period_end > now())
  );
end;
$$ language plpgsql security definer;

-- Grant execute permission to authenticated users
grant execute on function has_active_subscription(uuid) to authenticated;
