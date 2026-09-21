create or replace function public.seed_family_categories(target_family_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.categories (family_id, name, slug, created_by)
  select target_family_id, seed.name, seed.slug, family.created_by
  from public.families family
  cross join (values
    ('Moradia'::text, 'moradia'::text),
    ('Alimentação'::text, 'alimentacao'::text),
    ('Saúde'::text, 'saude'::text),
    ('Lazer'::text, 'lazer'::text)
  ) as seed(name, slug)
  where family.id = target_family_id
  on conflict (family_id, slug) do update
    set name = excluded.name,
        is_active = true;
$$;

do $$
declare
  family_record record;
begin
  for family_record in select id from public.families loop
    perform public.seed_family_categories(family_record.id);
  end loop;
end;
$$;
