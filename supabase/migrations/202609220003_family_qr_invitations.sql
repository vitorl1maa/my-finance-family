create table public.family_invitations (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  token_hash text not null unique,
  created_by uuid not null references auth.users(id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id)
);

create unique index family_members_user_id_key on public.family_members (user_id);

alter table public.family_invitations enable row level security;

create or replace function public.create_family_qr_invitation()
returns table (token text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_family_id uuid;
begin
  if current_user_id is null then
    raise exception 'authentication_required';
  end if;

  select member.family_id
  into current_family_id
  from public.family_members member
  where member.user_id = current_user_id
    and member.role = 'owner';

  if current_family_id is null then
    raise exception 'family_owner_required';
  end if;

  token := encode(gen_random_bytes(32), 'hex');
  expires_at := now() + interval '60 seconds';

  insert into public.family_invitations (family_id, token_hash, created_by, expires_at)
  values (
    current_family_id,
    encode(digest(token, 'sha256'), 'hex'),
    current_user_id,
    expires_at
  );

  return next;
end;
$$;

create or replace function public.accept_family_qr_invitation(raw_token text)
returns table (family_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'authentication_required';
  end if;

  if exists (
    select 1
    from public.family_members member
    where member.user_id = current_user_id
  ) then
    raise exception 'user_already_associated';
  end if;

  update public.family_invitations invitation
  set accepted_at = now(), accepted_by = current_user_id
  where invitation.token_hash = encode(digest(raw_token, 'sha256'), 'hex')
    and invitation.expires_at > now()
    and invitation.accepted_at is null
  returning invitation.family_id into family_id;

  if family_id is null then
    raise exception 'invalid_or_expired_invitation';
  end if;

  begin
    insert into public.family_members (family_id, user_id, role)
    values (family_id, current_user_id, 'member');
  exception
    when unique_violation then
      raise exception 'user_already_associated';
  end;

  return next;
end;
$$;

revoke all on function public.create_family_qr_invitation() from public;
revoke all on function public.accept_family_qr_invitation(text) from public;

grant execute on function public.create_family_qr_invitation() to authenticated;
grant execute on function public.accept_family_qr_invitation(text) to authenticated;
