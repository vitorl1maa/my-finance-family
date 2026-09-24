alter table public.income_sources
  add column if not exists created_by uuid references auth.users(id);

update public.income_sources source
set created_by = family.created_by
from public.families family
where source.family_id = family.id
  and source.created_by is null;

alter table public.income_sources
  alter column created_by set default auth.uid();

drop function if exists public.list_family_income_sources();
drop function if exists public.upsert_family_income_source(text, text, text, bigint);

create or replace function public.list_family_income_sources()
returns table (
  id text,
  name text,
  kind text,
  amount_cents bigint,
  updated_at timestamptz,
  created_by uuid,
  creator_name text,
  creator_avatar_url text,
  creator_avatar_seed text
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    source.id,
    source.name,
    source.kind,
    source.amount_cents,
    source.updated_at,
    source.created_by,
    coalesce(
      nullif(user_account.raw_user_meta_data ->> 'full_name', ''),
      nullif(user_account.raw_user_meta_data ->> 'name', ''),
      nullif(split_part(coalesce(user_account.email, ''), '@', 1), ''),
      'Membro'
    ),
    user_account.raw_user_meta_data ->> 'avatar_url',
    user_account.raw_user_meta_data ->> 'avatar_seed'
  from public.income_sources source
  left join auth.users user_account on user_account.id = source.created_by
  where source.family_id = public.current_family_id()
  order by source.name;
$$;

create or replace function public.upsert_family_income_source(
  client_id text,
  source_name text,
  source_kind text,
  source_amount_cents bigint
)
returns table (
  id text,
  name text,
  kind text,
  amount_cents bigint,
  updated_at timestamptz,
  created_by uuid,
  creator_name text,
  creator_avatar_url text,
  creator_avatar_seed text
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_family uuid := public.current_family_id();
  previous_amount bigint := 0;
begin
  if current_family is null then raise exception 'family_not_found'; end if;
  if trim(client_id) = '' or trim(source_name) = '' or source_amount_cents <= 0 then
    raise exception 'invalid_income_source';
  end if;
  if source_kind not in ('salary', 'investment', 'other') then
    raise exception 'invalid_income_source_kind';
  end if;

  insert into public.wallet_settings (family_id)
  values (current_family)
  on conflict (family_id) do nothing;

  select source.amount_cents into previous_amount
  from public.income_sources source
  where source.id = trim(client_id) and source.family_id = current_family
  for update;

  insert into public.income_sources as source (id, family_id, name, kind, amount_cents, created_by)
  values (trim(client_id), current_family, trim(source_name), source_kind, source_amount_cents, auth.uid())
  on conflict (id) do update set
    name = excluded.name,
    kind = excluded.kind,
    amount_cents = excluded.amount_cents,
    updated_at = now()
  where source.family_id = current_family;

  update public.wallet_settings
  set balance_cents = balance_cents + source_amount_cents - previous_amount,
      updated_at = now()
  where family_id = current_family;

  return query
  select
    source.id,
    source.name,
    source.kind,
    source.amount_cents,
    source.updated_at,
    source.created_by,
    coalesce(
      nullif(user_account.raw_user_meta_data ->> 'full_name', ''),
      nullif(user_account.raw_user_meta_data ->> 'name', ''),
      nullif(split_part(coalesce(user_account.email, ''), '@', 1), ''),
      'Membro'
    ),
    user_account.raw_user_meta_data ->> 'avatar_url',
    user_account.raw_user_meta_data ->> 'avatar_seed'
  from public.income_sources source
  left join auth.users user_account on user_account.id = source.created_by
  where source.id = trim(client_id) and source.family_id = current_family;
end;
$$;

revoke all on function public.list_family_income_sources() from public;
revoke all on function public.upsert_family_income_source(text, text, text, bigint) from public;
grant execute on function public.list_family_income_sources() to authenticated;
grant execute on function public.upsert_family_income_source(text, text, text, bigint) to authenticated;
