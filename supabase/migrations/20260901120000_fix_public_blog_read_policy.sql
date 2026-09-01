-- Public readers should never need permission to execute the privileged
-- is_admin() helper. Keep the public published-post rule and authenticated
-- admin preview rule as separate policies so Postgres can enforce each role
-- without evaluating an unavailable function for anonymous requests.

drop policy if exists "Anyone can view published blogs" on public.blogs;
drop policy if exists "Public can view published blogs" on public.blogs;
drop policy if exists "Admins can view all blogs" on public.blogs;

create policy "Public can view published blogs"
  on public.blogs
  for select
  to anon, authenticated
  using (status = 'published');

create policy "Admins can view all blogs"
  on public.blogs
  for select
  to authenticated
  using (public.is_admin());
