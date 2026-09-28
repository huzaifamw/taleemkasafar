begin;

-- Admin user management should display the application profile name, not only
-- optional auth metadata. The function remains SECURITY DEFINER because
-- ordinary profile RLS correctly prevents users from reading other profiles.
create or replace function public.get_all_users_admin(
  p_search text default '',
  p_page integer default 1,
  p_page_size integer default 20
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
  v_total integer;
  v_offset integer;
  v_search text := btrim(coalesce(p_search, ''));
begin
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required';
  end if;

  if p_page < 1 or p_page_size < 1 or p_page_size > 100 then
    raise exception 'Invalid pagination values';
  end if;

  v_offset := (p_page - 1) * p_page_size;

  select count(*)
  into v_total
  from auth.users user_row
  left join public.profiles profile on profile.id = user_row.id
  where v_search = ''
     or coalesce(user_row.email, '') ilike '%' || v_search || '%'
     or coalesce(profile.display_name, '') ilike '%' || v_search || '%'
     or coalesce(user_row.raw_user_meta_data ->> 'full_name', '')
        ilike '%' || v_search || '%'
     or coalesce(user_row.raw_user_meta_data ->> 'display_name', '')
        ilike '%' || v_search || '%';

  select jsonb_build_object(
    'users', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', user_page.id::text,
          'email', user_page.email,
          'created_at', user_page.created_at::text,
          'last_sign_in_at', user_page.last_sign_in_at::text,
          'email_confirmed_at', user_page.email_confirmed_at::text,
          'banned_until', user_page.banned_until::text,
          'display_name', user_page.display_name,
          'total_attempts', coalesce(stats.total_attempts, 0),
          'total_mocks', coalesce(stats.total_mocks, 0)
        )
        order by user_page.created_at desc
      ),
      '[]'::jsonb
    ),
    'total', v_total,
    'totalPages', ceil(v_total::numeric / p_page_size::numeric)::integer
  )
  into v_result
  from (
    select
      user_row.id,
      user_row.email,
      user_row.created_at,
      user_row.last_sign_in_at,
      user_row.email_confirmed_at,
      user_row.banned_until,
      coalesce(
        nullif(btrim(profile.display_name), ''),
        nullif(btrim(user_row.raw_user_meta_data ->> 'full_name'), ''),
        nullif(btrim(user_row.raw_user_meta_data ->> 'display_name'), ''),
        nullif(split_part(coalesce(user_row.email, ''), '@', 1), ''),
        'Student'
      ) as display_name
    from auth.users user_row
    left join public.profiles profile on profile.id = user_row.id
    where v_search = ''
       or coalesce(user_row.email, '') ilike '%' || v_search || '%'
       or coalesce(profile.display_name, '') ilike '%' || v_search || '%'
       or coalesce(user_row.raw_user_meta_data ->> 'full_name', '')
          ilike '%' || v_search || '%'
       or coalesce(user_row.raw_user_meta_data ->> 'display_name', '')
          ilike '%' || v_search || '%'
    order by user_row.created_at desc
    limit p_page_size
    offset v_offset
  ) user_page
  left join (
    select
      attempt.user_id,
      count(*) as total_attempts,
      count(*) filter (where attempt.mode = 'mock') as total_mocks
    from public.attempts attempt
    group by attempt.user_id
  ) stats on stats.user_id = user_page.id;

  return v_result;
end;
$$;

comment on function public.get_all_users_admin(text, integer, integer)
  is 'Returns paginated auth users with profile display names and attempt statistics for active admins';

revoke execute on function public.get_all_users_admin(text, integer, integer)
  from public, anon;
grant execute on function public.get_all_users_admin(text, integer, integer)
  to authenticated;

commit;
