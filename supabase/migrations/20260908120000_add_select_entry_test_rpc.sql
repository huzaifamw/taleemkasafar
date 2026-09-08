-- Atomically validate and save the authenticated user's active entry test.
-- Keeping this in one RPC removes a separate validation round trip while the
-- explicit auth.uid() predicate prevents changing another user's profile.
create or replace function public.select_entry_test(p_entry_test_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    return false;
  end if;

  update public.profiles profile
  set selected_test_id = p_entry_test_id
  where profile.id = v_user_id
    and exists (
      select 1
      from public.entry_tests entry_test
      where entry_test.id = p_entry_test_id
        and entry_test.is_active
    );

  return found;
end;
$$;

revoke all on function public.select_entry_test(uuid) from public, anon;
grant execute on function public.select_entry_test(uuid) to authenticated;

