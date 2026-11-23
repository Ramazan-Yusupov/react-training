create table public.account_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision uuid not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object')
);
alter table public.account_plans enable row level security;
revoke all on public.account_plans from public, anon, authenticated;
grant select, insert, update on public.account_plans to authenticated;
create policy "read own plan" on public.account_plans for select to authenticated
  using (user_id = (select auth.uid()));
create policy "create own plan" on public.account_plans for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "update own plan" on public.account_plans for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
