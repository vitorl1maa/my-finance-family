drop policy if exists "family members can update transactions" on public.transactions;
create policy "family members can update transactions"
  on public.transactions for update
  using (exists (select 1 from public.family_members member where member.family_id = transactions.family_id and member.user_id = auth.uid()))
  with check (exists (select 1 from public.family_members member where member.family_id = transactions.family_id and member.user_id = auth.uid()));

drop policy if exists "family members can delete transactions" on public.transactions;
create policy "family members can delete transactions"
  on public.transactions for delete
  using (exists (select 1 from public.family_members member where member.family_id = transactions.family_id and member.user_id = auth.uid()));
