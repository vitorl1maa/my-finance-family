create or replace function public.leave_current_family()
returns table (family_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_family_id uuid;
  current_role text;
  new_family_id uuid;
begin
  if current_user_id is null then
    raise exception 'authentication_required';
  end if;

  select member.family_id, member.role
  into current_family_id, current_role
  from public.family_members member
  where member.user_id = current_user_id
  for update;

  if current_family_id is null then
    raise exception 'not_in_family';
  end if;

  if current_role <> 'member' then
    raise exception 'family_owner_cannot_leave';
  end if;

  delete from public.family_members member
  where member.family_id = current_family_id and member.user_id = current_user_id;

  insert into public.families (name, created_by, is_bootstrap)
  values ('Minha família', current_user_id, true)
  returning id into new_family_id;

  insert into public.family_members (family_id, user_id, role)
  values (new_family_id, current_user_id, 'owner');

  insert into public.accounts (
    family_id, name, institution, kind, opening_balance_cents, balance_cents, created_by, is_default
  ) values (
    new_family_id, 'Conta principal', null, 'checking', 0, 0, current_user_id, true
  );

  family_id := new_family_id;
  return next;
end;
$$;

revoke all on function public.leave_current_family() from public;
grant execute on function public.leave_current_family() to authenticated;
