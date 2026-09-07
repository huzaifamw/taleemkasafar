-- FAST-NUCES BS CS/SE/DS mock blueprint.
-- FAST uses section weights that differ from raw question proportions, so the
-- scoring mode and per-section weight are stored explicitly. Existing mocks
-- retain uniform question-based scoring.

alter table public.mock_test_blueprints
  add column if not exists scoring_mode text not null default 'uniform';

alter table public.mock_blueprint_slots
  add column if not exists weight_percent numeric(6,3),
  add column if not exists section_duration_seconds integer;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_test_blueprints_scoring_mode_check'
  ) then
    alter table public.mock_test_blueprints
      add constraint mock_test_blueprints_scoring_mode_check
      check (scoring_mode in ('uniform', 'section_weighted'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_blueprint_slots_weight_percent_check'
  ) then
    alter table public.mock_blueprint_slots
      add constraint mock_blueprint_slots_weight_percent_check
      check (weight_percent is null or weight_percent > 0 and weight_percent <= 100);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'mock_blueprint_slots_section_duration_check'
  ) then
    alter table public.mock_blueprint_slots
      add constraint mock_blueprint_slots_section_duration_check
      check (section_duration_seconds is null or section_duration_seconds > 0);
  end if;
end
$$;

insert into public.mock_test_blueprints (
  external_id, entry_test_id, name, description, duration_seconds,
  total_questions, marks_per_correct, marks_per_incorrect,
  marks_per_unanswered, scoring_mode, is_active, display_order
)
select
  'fast-nuces-cs-se-ds-full-mock',
  et.id,
  'FAST-NUCES CS/SE/DS Full Mock',
  'A 120-minute FAST computing-program simulation: 50 Advanced Mathematics, 20 Basic Mathematics, 20 Analytical Skills & IQ, and 30 English questions. Section times are recommended allocations within the single 120-minute timer.',
  7200,
  120,
  1,
  0,
  0,
  'section_weighted',
  true,
  0
from public.entry_tests et
where et.slug = 'fast'
on conflict (external_id) do update set
  entry_test_id = excluded.entry_test_id,
  name = excluded.name,
  description = excluded.description,
  duration_seconds = excluded.duration_seconds,
  total_questions = excluded.total_questions,
  marks_per_correct = excluded.marks_per_correct,
  marks_per_incorrect = excluded.marks_per_incorrect,
  marks_per_unanswered = excluded.marks_per_unanswered,
  scoring_mode = excluded.scoring_mode,
  is_active = excluded.is_active,
  display_order = excluded.display_order;

insert into public.mock_blueprint_slots (
  blueprint_id, test_subject_id, question_count, past_paper_min,
  practice_max, difficulty_mix, weight_percent,
  section_duration_seconds, display_order
)
select
  bp.id,
  ts.id,
  values_.question_count,
  0,
  null,
  values_.difficulty_mix,
  values_.weight_percent,
  values_.section_duration_seconds,
  values_.display_order
from public.mock_test_blueprints bp
join public.entry_tests et on et.id = bp.entry_test_id and et.slug = 'fast'
join (
  values
    ('advanced-mathematics', 50, '{"easy":15,"medium":25,"hard":10}'::jsonb, 50.000::numeric, 3000, 0),
    ('basic-mathematics', 20, '{"easy":6,"medium":10,"hard":4}'::jsonb, 20.000::numeric, 1200, 1),
    ('iq-analytical-reasoning', 20, '{"easy":6,"medium":10,"hard":4}'::jsonb, 20.000::numeric, 1200, 2),
    ('english', 30, '{"easy":9,"medium":15,"hard":6}'::jsonb, 10.000::numeric, 1800, 3)
) as values_(subject_slug, question_count, difficulty_mix, weight_percent, section_duration_seconds, display_order)
  on true
join public.subjects subject on subject.slug = values_.subject_slug
join public.test_subjects ts
  on ts.entry_test_id = et.id
 and ts.subject_id = subject.id
 and ts.deleted_at is null
where bp.external_id = 'fast-nuces-cs-se-ds-full-mock'
on conflict (blueprint_id, test_subject_id) do update set
  question_count = excluded.question_count,
  past_paper_min = excluded.past_paper_min,
  practice_max = excluded.practice_max,
  difficulty_mix = excluded.difficulty_mix,
  weight_percent = excluded.weight_percent,
  section_duration_seconds = excluded.section_duration_seconds,
  display_order = excluded.display_order;

-- Grade section-weighted mocks by each section's accuracy multiplied by its
-- official weight. Uniform mocks keep the original raw accuracy calculation.
create or replace function public.submit_mock(p_attempt uuid, p_answers jsonb)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := (select auth.uid());
  v_blueprint uuid;
  v_score numeric(6,2);
begin
  if v_user is null then raise exception 'forbidden'; end if;

  select a.blueprint_id into v_blueprint
  from public.attempts a
  where a.id = p_attempt and a.user_id = v_user and a.mode = 'mock';

  if not found then raise exception 'forbidden'; end if;

  if exists (select 1 from public.mock_results where attempt_id = p_attempt) then
    return p_attempt;
  end if;

  update public.attempt_answers aa
  set selected_option_id = nullif(e.value ->> 'selected_option_id', '')::uuid,
      time_taken_ms = nullif(e.value ->> 'time_taken_ms', '')::int
  from jsonb_array_elements(coalesce(p_answers, '[]'::jsonb)) e
  where aa.attempt_id = p_attempt
    and aa.question_id = (e.value ->> 'question_id')::uuid;

  update public.attempt_answers aa
  set is_correct = (
    aa.selected_option_id is not null
    and exists (
      select 1 from public.question_options option_
      where option_.id = aa.selected_option_id
        and option_.question_id = aa.question_id
        and option_.is_correct
    )
  )
  where aa.attempt_id = p_attempt;

  if exists (
    select 1
    from public.mock_test_blueprints bp
    where bp.id = v_blueprint and bp.scoring_mode = 'section_weighted'
  ) then
    select round(coalesce(sum(
      slot.weight_percent * coalesce(section_.correct_count, 0)::numeric
      / nullif(section_.question_count, 0)
    ), 0), 2)
    into v_score
    from public.mock_blueprint_slots slot
    join public.test_subjects ts on ts.id = slot.test_subject_id
    left join lateral (
      select
        count(*) as question_count,
        count(*) filter (where aa.is_correct) as correct_count
      from public.attempt_answers aa
      join public.questions q on q.id = aa.question_id
      where aa.attempt_id = p_attempt and q.subject_id = ts.subject_id
    ) section_ on true
    where slot.blueprint_id = v_blueprint;
  else
    select round(
      100.0 * count(*) filter (where aa.is_correct) / nullif(count(*), 0),
      2
    )
    into v_score
    from public.attempt_answers aa
    where aa.attempt_id = p_attempt;
  end if;

  insert into public.mock_results (
    attempt_id, total_questions, attempted_count, correct_count,
    incorrect_count, skipped_count, score_percent, total_time_ms, per_subject
  )
  select
    p_attempt,
    count(*),
    count(*) filter (where aa.selected_option_id is not null),
    count(*) filter (where aa.is_correct),
    count(*) filter (where aa.selected_option_id is not null and not aa.is_correct),
    count(*) filter (where aa.selected_option_id is null),
    v_score,
    sum(aa.time_taken_ms),
    coalesce((
      select jsonb_object_agg(
        subject.slug,
        jsonb_build_object('correct', counts.correct, 'total', counts.total)
      )
      from (
        select q.subject_id,
               count(*) as total,
               count(*) filter (where aa2.is_correct) as correct
        from public.attempt_answers aa2
        join public.questions q on q.id = aa2.question_id
        where aa2.attempt_id = p_attempt
        group by q.subject_id
      ) counts
      join public.subjects subject on subject.id = counts.subject_id
    ), '{}'::jsonb)
  from public.attempt_answers aa
  where aa.attempt_id = p_attempt;

  update public.attempts
  set status = 'submitted', submitted_at = now()
  where id = p_attempt;

  return p_attempt;
end;
$$;

revoke execute on function public.submit_mock(uuid, jsonb) from anon, public;
grant execute on function public.submit_mock(uuid, jsonb) to authenticated;

do $$
declare
  v_blueprint_id uuid;
  v_questions integer;
  v_weight numeric;
  v_duration integer;
begin
  select id into v_blueprint_id
  from public.mock_test_blueprints
  where external_id = 'fast-nuces-cs-se-ds-full-mock';

  if v_blueprint_id is null then
    raise exception 'FAST mock blueprint was not created';
  end if;

  select sum(question_count), sum(weight_percent), sum(section_duration_seconds)
  into v_questions, v_weight, v_duration
  from public.mock_blueprint_slots
  where blueprint_id = v_blueprint_id;

  if v_questions <> 120 or v_weight <> 100 or v_duration <> 7200 then
    raise exception 'Invalid FAST mock blueprint: questions %, weight %, duration %',
      v_questions, v_weight, v_duration;
  end if;
end
$$;
