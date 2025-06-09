-- Insert sample tips (if you want to store them in the database instead of JSON)
create table if not exists tips (
  id uuid primary key default gen_random_uuid(),
  tip text not null,
  category text not null,
  created_at timestamp default now()
);

-- Insert sample tips
insert into tips (tip, category) values
('Drink 500 ml of water before each meal to curb hunger.', 'hydration'),
('Eat slowly and mindfully to recognize when you''re full.', 'mindfulness'),
('Add protein to every meal to stay fuller longer.', 'nutrition'),
('Prepare your meals in advance to avoid unhealthy choices when hungry.', 'planning'),
('Use smaller plates to control portion sizes naturally.', 'portion'),
('Include vegetables in at least two meals per day.', 'nutrition'),
('Take a 10-minute walk after meals to aid digestion.', 'activity'),
('Avoid eating 2-3 hours before bedtime for better sleep.', 'timing'),
('Replace sugary drinks with water, tea, or infused water.', 'hydration'),
('Read nutrition labels to make informed food choices.', 'awareness');

-- Create indexes for better performance
create index if not exists idx_profiles_user_id on profiles(id);
create index if not exists idx_diets_user_id on diets(user_id);
create index if not exists idx_diets_created_at on diets(created_at);

-- Create a function to get user stats
create or replace function get_user_stats(user_uuid uuid)
returns json as $$
declare
  result json;
begin
  select json_build_object(
    'total_diets', (select count(*) from diets where user_id = user_uuid),
    'days_active', (
      select case 
        when min(created_at) is null then 0
        else extract(days from now() - min(created_at))::int + 1
      end
      from diets where user_id = user_uuid
    ),
    'avg_calories', (
      select coalesce(avg((plan->>'totalCalories')::int), 0)::int
      from diets where user_id = user_uuid
    )
  ) into result;
  
  return result;
end;
$$ language plpgsql security definer;
