create or replace function public.accept_family_qr_invitation(raw_token text)
returns table (family_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  invitation_id uuid;
  invited_family_id uuid;
  bootstrap_family_id uuid;
  membership_count integer;
begin
  if current_user_id is null then
    raise exception 'authentication_required';
  end if;

  select invitation.id, invitation.family_id
  into invitation_id, invited_family_id
  from public.family_invitations invitation
  where invitation.token_hash = encode(extensions.digest(raw_token, 'sha256'), 'hex')
    and invitation.expires_at > now()
    and invitation.accepted_at is null
  for update;

  if invitation_id is null then
    raise exception 'invalid_or_expired_invitation';
  end if;

  select count(*) into membership_count
  from public.family_members member
  where member.user_id = current_user_id;

  if membership_count = 1 then
    select family.id into bootstrap_family_id
    from public.families family
    join public.family_members member on member.family_id = family.id
    where member.user_id = current_user_id and member.role = 'owner'
      and family.is_bootstrap and family.created_by = current_user_id
      and family.id <> invited_family_id
    for update of family;

    if bootstrap_family_id is null
      or exists (select 1 from public.family_members member where member.family_id = bootstrap_family_id and member.user_id <> current_user_id)
      or exists (select 1 from public.transactions transaction where transaction.family_id = bootstrap_family_id)
      or exists (select 1 from public.expenses expense where expense.family_id = bootstrap_family_id)
      or exists (select 1 from public.goals goal where goal.family_id = bootstrap_family_id)
      or exists (select 1 from public.income_sources income_source where income_source.family_id = bootstrap_family_id)
      or exists (select 1 from public.piggy_bank_settings settings where settings.family_id = bootstrap_family_id and settings.balance_cents <> 0)
      or exists (select 1 from public.accounts account where account.family_id = bootstrap_family_id and (account.opening_balance_cents <> 0 or account.balance_cents <> 0)) then
      raise exception 'user_already_associated';
    end if;
  elsif membership_count > 1 then
    raise exception 'user_already_associated';
  end if;

  update public.family_invitations invitation
  set accepted_at = now(), accepted_by = current_user_id
  where invitation.id = invitation_id;

  if bootstrap_family_id is not null then
    delete from public.families family where family.id = bootstrap_family_id;
  end if;

  begin
    insert into public.family_members (family_id, user_id, role)
    values (invited_family_id, current_user_id, 'member');
  exception when unique_violation then
    raise exception 'user_already_associated';
  end;

  family_id := invited_family_id;
  return next;
end;
$$;
