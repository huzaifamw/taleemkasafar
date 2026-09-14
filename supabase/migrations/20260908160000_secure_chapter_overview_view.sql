-- The usage-count migration recreated this view and inadvertently restored
-- definer behavior. Run it with the querying role's privileges so the explicit
-- RLS policies on catalog tables remain in force.
alter view public.chapter_overview set (security_invoker = true);

