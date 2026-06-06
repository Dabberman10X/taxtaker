alter table public.partner_leads
add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_partner_leads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists partner_leads_set_updated_at on public.partner_leads;

create trigger partner_leads_set_updated_at
before update on public.partner_leads
for each row
execute function public.set_partner_leads_updated_at();