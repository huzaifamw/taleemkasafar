-- The PU importer derived a topic external_id from the long chapter slug, but
-- this topic was originally seeded with a shorter external_id. Reattach the 35
-- approved questions to the canonical chapter so its Practice count is shown.
update public.questions question
set topic_id = topic.id
from public.topics topic
join public.subjects subject on subject.id = topic.subject_id
where question.subject_id = subject.id
  and subject.slug = 'verbal-reasoning'
  and topic.slug = 'sentence-completion-with-grammatical-words'
  and question.external_id like
    'pu-verbal-reasoning-sentence-completion-with-grammatical-words-q%'
  and question.topic_id is null;

do $$
declare
  v_count integer;
begin
  select count(*)
  into v_count
  from public.questions question
  join public.topics topic on topic.id = question.topic_id
  join public.subjects subject on subject.id = question.subject_id
  join public.question_tests question_test on question_test.question_id = question.id
  join public.entry_tests entry_test on entry_test.id = question_test.entry_test_id
  where subject.slug = 'verbal-reasoning'
    and topic.slug = 'sentence-completion-with-grammatical-words'
    and entry_test.slug = 'pu'
    and question_test.usage_type = 'practice'::public.question_usage
    and question.deleted_at is null
    and question.moderation_status = 'approved'::public.moderation_status;

  if v_count <> 35 then
    raise exception 'Expected 35 mapped PU verbal questions, found %', v_count;
  end if;
end
$$;

