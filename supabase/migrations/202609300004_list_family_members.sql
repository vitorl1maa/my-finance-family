create or replace function public.list_family_members()
returns table (user_id uuid, role text, email text, first_name text, last_name text, avatar_url text)
language sql
stable
security definer
set search_path = public, auth
as $$
  select member.user_id, member.role, user_account.email,
    user_account.raw_user_meta_data ->> 'first_name',
    user_account.raw_user_meta_data ->> 'last_name',
    user_account.raw_user_meta_data ->> 'avatar_url'
  from public.family_members member
  join auth.users user_account on user_account.id = member.user_id
  where member.family_id = public.current_family_id()
  order by case member.role when 'owner' then 0 else 1 end, member.joined_at;
$$;

revoke all on function public.list_family_members() from public;
grant execute on function public.list_family_members() to authenticated;
