create extension if not exists pgcrypto;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  status text not null default 'new',
  assigned_agent text not null default '2ic',
  source text not null default 'telegram',
  source_chat_id bigint,
  source_user_id bigint,
  source_username text,
  raw_payload jsonb not null default '{}'::jsonb,
  result jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

alter table public.tasks enable row level security;

drop policy if exists "deny anon tasks" on public.tasks;
create policy "deny anon tasks"
on public.tasks
for all
to anon
using (false)
with check (false);

drop policy if exists "deny authenticated tasks" on public.tasks;
create policy "deny authenticated tasks"
on public.tasks
for all
to authenticated
using (false)
with check (false);