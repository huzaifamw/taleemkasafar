-- Expose separate practice and past-paper totals for each chapter so the UI
-- can disable only the empty learning mode. A question_tests row has exactly
-- one usage_type, so the two counts also add up to question_count.
create or replace view public.chapter_overview
with (security_invoker = false) as
select
  test_subject.entry_test_id,
  entry_test.slug                       as entry_test_slug,
  topic.subject_id                      as subject_id,
  subject.slug                          as subject_slug,
  topic.id                              as chapter_id,
  topic.external_id                     as chapter_external_id,
  topic.slug                            as chapter_slug,
  topic.title                           as chapter_title,
  topic.kind                            as chapter_kind,
  topic.display_order                   as display_order,
  (
    select count(*)
    from public.topics child
    where child.parent_topic_id = topic.id
      and child.deleted_at is null
  )                                     as subtopic_count,
  question_counts.total_count           as question_count,
  question_counts.practice_count        as practice_count,
  question_counts.past_paper_count      as past_paper_count
from public.test_subjects test_subject
join public.entry_tests entry_test on entry_test.id = test_subject.entry_test_id
join public.subjects subject on subject.id = test_subject.subject_id
join public.topics topic on topic.subject_id = test_subject.subject_id
cross join lateral (
  select
    count(*) as total_count,
    count(*) filter (
      where question_test.usage_type = 'practice'::public.question_usage
    ) as practice_count,
    count(*) filter (
      where question_test.usage_type = 'past_paper'::public.question_usage
    ) as past_paper_count
  from public.questions question
  join public.question_tests question_test
    on question_test.question_id = question.id
   and question_test.entry_test_id = test_subject.entry_test_id
  where question.deleted_at is null
    and question.moderation_status = 'approved'::public.moderation_status
    and (
      question.topic_id = topic.id
      or question.topic_id in (
        select child.id
        from public.topics child
        where child.parent_topic_id = topic.id
          and child.deleted_at is null
      )
    )
) question_counts
where test_subject.deleted_at is null
  and test_subject.is_active
  and topic.parent_topic_id is null
  and topic.deleted_at is null;

grant select on public.chapter_overview to anon, authenticated;

