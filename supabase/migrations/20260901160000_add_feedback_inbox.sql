create table if not exists public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) <= 254),
  message text not null check (char_length(message) between 20 and 2000),
  status text not null default 'new' check (status in ('new', 'reviewed', 'resolved')),
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_feedback_status_created on public.feedback_submissions(status, created_at desc);
create index if not exists idx_feedback_email_created on public.feedback_submissions(lower(email), created_at desc);

drop trigger if exists feedback_submissions_updated_at on public.feedback_submissions;
create trigger feedback_submissions_updated_at before update on public.feedback_submissions
  for each row execute function public.handle_updated_at();

alter table public.feedback_submissions enable row level security;
drop policy if exists "Admins can view feedback" on public.feedback_submissions;
drop policy if exists "Admins can update feedback" on public.feedback_submissions;
drop policy if exists "Admins can delete feedback" on public.feedback_submissions;
create policy "Admins can view feedback" on public.feedback_submissions for select to authenticated using (public.is_admin());
create policy "Admins can update feedback" on public.feedback_submissions for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete feedback" on public.feedback_submissions for delete to authenticated using (public.is_admin());

revoke all on public.feedback_submissions from anon, authenticated;
grant select, update, delete on public.feedback_submissions to authenticated;

create or replace function public.submit_feedback(p_name text, p_email text, p_message text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_name text := btrim(p_name);
  v_email text := lower(btrim(p_email));
  v_message text := btrim(p_message);
  v_id uuid;
begin
  if char_length(v_name) < 2 or char_length(v_name) > 100 then raise exception 'Name must be between 2 and 100 characters'; end if;
  if char_length(v_email) > 254 or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then raise exception 'A valid email address is required'; end if;
  if char_length(v_message) < 20 or char_length(v_message) > 2000 then raise exception 'Feedback must be between 20 and 2000 characters'; end if;
  if (select count(*) from public.feedback_submissions where lower(email) = v_email and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'Too many submissions. Please try again later';
  end if;
  insert into public.feedback_submissions(name, email, message, user_id)
    values (v_name, v_email, v_message, auth.uid()) returning id into v_id;
  return v_id;
end;
$$;

revoke execute on function public.submit_feedback(text, text, text) from public;
grant execute on function public.submit_feedback(text, text, text) to anon, authenticated;
