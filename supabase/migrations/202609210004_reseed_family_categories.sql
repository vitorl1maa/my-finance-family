-- Repair categories for families created before the category seed migration.
do $$
declare
  family_record record;
begin
  for family_record in select id from public.families loop
    perform public.seed_family_categories(family_record.id);
  end loop;
end;
$$;
