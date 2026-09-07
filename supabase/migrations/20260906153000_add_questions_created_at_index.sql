-- Speeds admin question listings ordered by creation date.
create index if not exists idx_questions_created_at
  on public.questions using btree (created_at);
