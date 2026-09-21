update public.categories
set slug = lower(regexp_replace(trim(name), '[[:space:]]+', '-', 'g'))
where slug is null
  or slug ~ '[[:space:]]';
