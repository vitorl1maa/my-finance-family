drop policy if exists "family members can delete income sources" on public.income_sources;
create policy "family members can delete income sources"
  on public.income_sources for delete
  using (public.is_family_member(family_id));
