create or replace function public.preview_family_qr_invitation(raw_token text)
returns table (administrator_name text)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  invitation_creator_id uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  select invitation.created_by
  into invitation_creator_id
  from public.family_invitations invitation
  where invitation.token_hash = encode(digest(raw_token, 'sha256'), 'hex')
    and invitation.expires_at > now()
    and invitation.accepted_at is null;

  if invitation_creator_id is null then
    raise exception 'invalid_or_expired_invitation';
  end if;

  select coalesce(nullif(trim(user_record.raw_user_meta_data ->> 'first_name'), ''), 'administrador')
  into administrator_name
  from auth.users user_record
  where user_record.id = invitation_creator_id;

  administrator_name := coalesce(administrator_name, 'administrador');
  return next;
end;
$$;

revoke all on function public.preview_family_qr_invitation(text) from public;
grant execute on function public.preview_family_qr_invitation(text) to authenticated;
