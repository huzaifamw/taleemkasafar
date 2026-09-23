begin;

-- Save a blueprint and all of its slots in one transaction. The function owns
-- the validation boundary so malformed or partially saved configurations can
-- never reach mock generation.
create or replace function public.save_mock_blueprint(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_blueprint_id uuid := nullif(p_payload ->> 'blueprint_id', '')::uuid;
  v_entry_test_id uuid := nullif(p_payload ->> 'entry_test_id', '')::uuid;
  v_name text := btrim(coalesce(p_payload ->> 'name', ''));
  v_description text := nullif(btrim(coalesce(p_payload ->> 'description', '')), '');
  v_duration integer := coalesce((p_payload ->> 'duration_seconds')::integer, 0);
  v_total integer := coalesce((p_payload ->> 'total_questions')::integer, 0);
  v_scoring_mode text := coalesce(p_payload ->> 'scoring_mode', 'uniform');
  v_marks_correct numeric := coalesce((p_payload ->> 'marks_per_correct')::numeric, 1);
  v_marks_incorrect numeric := coalesce((p_payload ->> 'marks_per_incorrect')::numeric, 0);
  v_marks_unanswered numeric := coalesce((p_payload ->> 'marks_per_unanswered')::numeric, 0);
  v_is_active boolean := coalesce((p_payload ->> 'is_active')::boolean, true);
  v_display_order integer := coalesce((p_payload ->> 'display_order')::integer, 0);
  v_slot_total integer;
  v_weight_total numeric;
  v_section_duration_total integer;
  v_subject_id uuid;
  v_available_past integer;
  v_available_practice integer;
  v_need integer;
  v_past_lower integer;
  v_past_upper integer;
  v_diff text;
  slot record;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  if v_entry_test_id is null or not exists (
    select 1 from public.entry_tests where id = v_entry_test_id
  ) then
    raise exception 'Entry test not found';
  end if;
  if char_length(v_name) not between 3 and 120 then
    raise exception 'Blueprint name must be between 3 and 120 characters';
  end if;
  if char_length(coalesce(v_description, '')) > 1000 then
    raise exception 'Description must be 1,000 characters or fewer';
  end if;
  if v_duration not between 60 and 86400 then
    raise exception 'Duration must be between 1 minute and 24 hours';
  end if;
  if v_total not between 1 and 1000 then
    raise exception 'Total questions must be between 1 and 1,000';
  end if;
  if v_scoring_mode not in ('uniform', 'section_weighted') then
    raise exception 'Invalid scoring mode';
  end if;
  if v_marks_correct not between -100 and 100
     or v_marks_incorrect not between -100 and 100
     or v_marks_unanswered not between -100 and 100 then
    raise exception 'Scoring values must be between -100 and 100';
  end if;
  if jsonb_typeof(p_payload -> 'slots') <> 'array'
     or jsonb_array_length(p_payload -> 'slots') = 0 then
    raise exception 'At least one subject slot is required';
  end if;
  if (
    select count(*) <> count(distinct item ->> 'test_subject_id')
    from jsonb_array_elements(p_payload -> 'slots') item
  ) then
    raise exception 'Each subject can appear only once';
  end if;

  select coalesce(sum((item ->> 'question_count')::integer), 0),
         coalesce(sum((item ->> 'weight_percent')::numeric), 0),
         coalesce(sum((item ->> 'section_duration_seconds')::integer), 0)
  into v_slot_total, v_weight_total, v_section_duration_total
  from jsonb_array_elements(p_payload -> 'slots') item;

  if v_slot_total <> v_total then
    raise exception 'Subject slot totals (%) must equal blueprint total (%)',
      v_slot_total, v_total;
  end if;
  if v_scoring_mode = 'section_weighted'
     and (abs(v_weight_total - 100) > 0.001
          or v_section_duration_total <> v_duration) then
    raise exception 'Section weights must total 100 and section times must equal the test duration';
  end if;

  for slot in
    select *
    from jsonb_to_recordset(p_payload -> 'slots') as x(
      test_subject_id uuid,
      question_count integer,
      past_paper_min integer,
      practice_max integer,
      difficulty_mix jsonb,
      weight_percent numeric,
      section_duration_seconds integer,
      display_order integer
    )
  loop
    if slot.question_count <= 0
       or slot.past_paper_min < 0
       or slot.practice_max < 0
       or slot.past_paper_min + slot.practice_max <> slot.question_count then
      raise exception 'Each slot needs positive, matching question and source totals';
    end if;
    if coalesce((slot.difficulty_mix ->> 'easy')::integer, 0)
       + coalesce((slot.difficulty_mix ->> 'medium')::integer, 0)
       + coalesce((slot.difficulty_mix ->> 'hard')::integer, 0)
       <> slot.question_count then
      raise exception 'Difficulty counts must equal the subject question count';
    end if;
    if v_scoring_mode = 'section_weighted'
       and (coalesce(slot.weight_percent, 0) <= 0
            or coalesce(slot.section_duration_seconds, 0) < 60) then
      raise exception 'Every weighted section needs a positive weight and duration';
    end if;

    select ts.subject_id
    into v_subject_id
    from public.test_subjects ts
    where ts.id = slot.test_subject_id
      and ts.entry_test_id = v_entry_test_id
      and ts.deleted_at is null
      and ts.is_active;

    if v_subject_id is null then
      raise exception 'A selected subject is not active for this entry test';
    end if;

    -- Verify that one exact source/difficulty allocation exists. For each
    -- difficulty, the past-paper allocation has a lower and upper bound. The
    -- requested total is feasible iff it falls within their combined range.
    v_past_lower := 0;
    v_past_upper := 0;
    foreach v_diff in array array['easy', 'medium', 'hard'] loop
      v_need := coalesce((slot.difficulty_mix ->> v_diff)::integer, 0);
      if v_need < 0 then
        raise exception 'Difficulty counts cannot be negative';
      end if;

      select
        count(*) filter (where qt.usage_type = 'past_paper'),
        count(*) filter (where qt.usage_type = 'practice')
      into v_available_past, v_available_practice
      from public.question_tests qt
      join public.questions q on q.id = qt.question_id
      where qt.entry_test_id = v_entry_test_id
        and q.subject_id = v_subject_id
        and q.deleted_at is null
        and q.moderation_status = 'approved'
        and coalesce(qt.difficulty, q.difficulty) = v_diff::difficulty;

      if v_available_past + v_available_practice < v_need then
        raise exception 'The question bank cannot satisfy the % difficulty mix for one selected subject',
          v_diff;
      end if;
      v_past_lower := v_past_lower + greatest(0, v_need - v_available_practice);
      v_past_upper := v_past_upper + least(v_need, v_available_past);
    end loop;

    if slot.past_paper_min < v_past_lower
       or slot.past_paper_min > v_past_upper then
      raise exception 'The question bank cannot satisfy the selected past-paper, practice and difficulty mix';
    end if;
  end loop;

  if v_blueprint_id is null then
    insert into public.mock_test_blueprints (
      entry_test_id, name, description, duration_seconds, total_questions,
      marks_per_correct, marks_per_incorrect, marks_per_unanswered,
      scoring_mode, is_active, display_order
    ) values (
      v_entry_test_id, v_name, v_description, v_duration, v_total,
      v_marks_correct, v_marks_incorrect, v_marks_unanswered,
      v_scoring_mode, v_is_active, v_display_order
    )
    returning id into v_blueprint_id;
  else
    if not exists (
      select 1 from public.mock_test_blueprints
      where id = v_blueprint_id and entry_test_id = v_entry_test_id
    ) then
      raise exception 'Blueprint not found for this entry test';
    end if;
    if exists (
      select 1 from public.attempts where blueprint_id = v_blueprint_id
    ) then
      raise exception 'Blueprints with generated attempts cannot be structurally edited. Create a new blueprint instead';
    end if;

    update public.mock_test_blueprints
    set name = v_name,
        description = v_description,
        duration_seconds = v_duration,
        total_questions = v_total,
        marks_per_correct = v_marks_correct,
        marks_per_incorrect = v_marks_incorrect,
        marks_per_unanswered = v_marks_unanswered,
        scoring_mode = v_scoring_mode,
        is_active = v_is_active,
        display_order = v_display_order,
        updated_at = now()
    where id = v_blueprint_id;

    delete from public.mock_blueprint_slots
    where blueprint_id = v_blueprint_id;
  end if;

  insert into public.mock_blueprint_slots (
    blueprint_id, test_subject_id, question_count, past_paper_min,
    practice_max, difficulty_mix, weight_percent,
    section_duration_seconds, display_order
  )
  select
    v_blueprint_id,
    slot.test_subject_id,
    slot.question_count,
    slot.past_paper_min,
    slot.practice_max,
    slot.difficulty_mix,
    case when v_scoring_mode = 'section_weighted' then slot.weight_percent end,
    case when v_scoring_mode = 'section_weighted' then slot.section_duration_seconds end,
    slot.display_order
  from jsonb_to_recordset(p_payload -> 'slots') as slot(
    test_subject_id uuid,
    question_count integer,
    past_paper_min integer,
    practice_max integer,
    difficulty_mix jsonb,
    weight_percent numeric,
    section_duration_seconds integer,
    display_order integer
  );

  return v_blueprint_id;
end;
$$;

revoke execute on function public.save_mock_blueprint(jsonb) from public, anon;
grant execute on function public.save_mock_blueprint(jsonb) to authenticated;

-- Generate exact source and difficulty allocations for newly configured slots.
-- Legacy slots with practice_max = null retain their previous any-source logic.
create or replace function public.generate_mock_attempt(p_blueprint uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_test uuid;
  v_duration integer;
  v_expected integer;
  v_attempt uuid;
  v_pos integer := 0;
  v_inserted integer;
  v_slot_have integer;
  v_remainder integer;
  v_need integer;
  v_available_past integer;
  v_available_practice integer;
  v_lower integer;
  v_upper integer;
  v_remaining_past integer;
  v_headroom integer;
  v_take integer;
  v_past_need integer;
  v_practice_need integer;
  v_past_plan jsonb;
  v_upper_plan jsonb;
  slot record;
  d text;
begin
  if v_user is null then raise exception 'forbidden'; end if;

  select entry_test_id, duration_seconds, total_questions
  into v_test, v_duration, v_expected
  from public.mock_test_blueprints
  where id = p_blueprint and is_active;
  if v_test is null then raise exception 'blueprint not found'; end if;

  insert into public.attempts (
    user_id, entry_test_id, mode, blueprint_id, status, expires_at
  ) values (
    v_user, v_test, 'mock', p_blueprint, 'in_progress',
    now() + make_interval(secs => v_duration)
  ) returning id into v_attempt;

  for slot in
    select mbs.test_subject_id, mbs.question_count, mbs.past_paper_min,
           mbs.practice_max, mbs.difficulty_mix, mbs.display_order,
           ts.subject_id
    from public.mock_blueprint_slots mbs
    join public.test_subjects ts on ts.id = mbs.test_subject_id
    where mbs.blueprint_id = p_blueprint
    order by mbs.display_order
  loop
    v_slot_have := 0;

    if slot.practice_max is null then
      -- Backward-compatible generation for seeded legacy blueprints.
      foreach d in array array['easy', 'medium', 'hard'] loop
        v_need := coalesce((slot.difficulty_mix ->> d)::integer, 0);
        if v_need > 0 then
          insert into public.attempt_answers (attempt_id, question_id, display_order)
          select v_attempt, picked.id, v_pos + row_number() over ()
          from (
            select q.id
            from public.questions q
            join public.question_tests qt
              on qt.question_id = q.id and qt.entry_test_id = v_test
            where q.subject_id = slot.subject_id
              and q.deleted_at is null
              and q.moderation_status = 'approved'
              and coalesce(qt.difficulty, q.difficulty) = d::difficulty
              and not exists (
                select 1 from public.attempt_answers aa
                where aa.attempt_id = v_attempt and aa.question_id = q.id
              )
            order by random()
            limit v_need
          ) picked;
          get diagnostics v_inserted = row_count;
          v_pos := v_pos + v_inserted;
          v_slot_have := v_slot_have + v_inserted;
        end if;
      end loop;

      v_remainder := slot.question_count - v_slot_have;
      if v_remainder > 0 then
        insert into public.attempt_answers (attempt_id, question_id, display_order)
        select v_attempt, picked.id, v_pos + row_number() over ()
        from (
          select q.id
          from public.questions q
          join public.question_tests qt
            on qt.question_id = q.id and qt.entry_test_id = v_test
          where q.subject_id = slot.subject_id
            and q.deleted_at is null
            and q.moderation_status = 'approved'
            and not exists (
              select 1 from public.attempt_answers aa
              where aa.attempt_id = v_attempt and aa.question_id = q.id
            )
          order by random()
          limit v_remainder
        ) picked;
        get diagnostics v_inserted = row_count;
        v_pos := v_pos + v_inserted;
        v_slot_have := v_slot_have + v_inserted;
      end if;
    else
      if slot.past_paper_min + slot.practice_max <> slot.question_count then
        raise exception 'invalid source totals in mock blueprint';
      end if;

      v_past_plan := '{}'::jsonb;
      v_upper_plan := '{}'::jsonb;
      v_remaining_past := slot.past_paper_min;

      foreach d in array array['easy', 'medium', 'hard'] loop
        v_need := coalesce((slot.difficulty_mix ->> d)::integer, 0);
        select
          count(*) filter (where qt.usage_type = 'past_paper'),
          count(*) filter (where qt.usage_type = 'practice')
        into v_available_past, v_available_practice
        from public.question_tests qt
        join public.questions q on q.id = qt.question_id
        where qt.entry_test_id = v_test
          and q.subject_id = slot.subject_id
          and q.deleted_at is null
          and q.moderation_status = 'approved'
          and coalesce(qt.difficulty, q.difficulty) = d::difficulty;

        v_lower := greatest(0, v_need - v_available_practice);
        v_upper := least(v_need, v_available_past);
        if v_lower > v_upper then
          raise exception 'question bank no longer satisfies blueprint';
        end if;
        v_past_plan := jsonb_set(v_past_plan, array[d], to_jsonb(v_lower), true);
        v_upper_plan := jsonb_set(v_upper_plan, array[d], to_jsonb(v_upper), true);
        v_remaining_past := v_remaining_past - v_lower;
      end loop;

      if v_remaining_past < 0 then
        raise exception 'question bank no longer satisfies source mix';
      end if;
      foreach d in array array['medium', 'hard', 'easy'] loop
        v_headroom := (v_upper_plan ->> d)::integer - (v_past_plan ->> d)::integer;
        v_take := least(v_headroom, v_remaining_past);
        v_past_plan := jsonb_set(
          v_past_plan,
          array[d],
          to_jsonb((v_past_plan ->> d)::integer + v_take),
          true
        );
        v_remaining_past := v_remaining_past - v_take;
      end loop;
      if v_remaining_past <> 0 then
        raise exception 'question bank no longer satisfies source mix';
      end if;

      foreach d in array array['easy', 'medium', 'hard'] loop
        v_need := coalesce((slot.difficulty_mix ->> d)::integer, 0);
        v_past_need := coalesce((v_past_plan ->> d)::integer, 0);
        v_practice_need := v_need - v_past_need;

        if v_past_need > 0 then
          insert into public.attempt_answers (attempt_id, question_id, display_order)
          select v_attempt, picked.id, v_pos + row_number() over ()
          from (
            select q.id
            from public.questions q
            join public.question_tests qt
              on qt.question_id = q.id and qt.entry_test_id = v_test
            where q.subject_id = slot.subject_id
              and q.deleted_at is null
              and q.moderation_status = 'approved'
              and qt.usage_type = 'past_paper'
              and coalesce(qt.difficulty, q.difficulty) = d::difficulty
            order by random()
            limit v_past_need
          ) picked;
          get diagnostics v_inserted = row_count;
          if v_inserted <> v_past_need then
            raise exception 'question bank changed while generating mock';
          end if;
          v_pos := v_pos + v_inserted;
          v_slot_have := v_slot_have + v_inserted;
        end if;

        if v_practice_need > 0 then
          insert into public.attempt_answers (attempt_id, question_id, display_order)
          select v_attempt, picked.id, v_pos + row_number() over ()
          from (
            select q.id
            from public.questions q
            join public.question_tests qt
              on qt.question_id = q.id and qt.entry_test_id = v_test
            where q.subject_id = slot.subject_id
              and q.deleted_at is null
              and q.moderation_status = 'approved'
              and qt.usage_type = 'practice'
              and coalesce(qt.difficulty, q.difficulty) = d::difficulty
            order by random()
            limit v_practice_need
          ) picked;
          get diagnostics v_inserted = row_count;
          if v_inserted <> v_practice_need then
            raise exception 'question bank changed while generating mock';
          end if;
          v_pos := v_pos + v_inserted;
          v_slot_have := v_slot_have + v_inserted;
        end if;
      end loop;
    end if;

    if v_slot_have <> slot.question_count then
      raise exception 'mock subject slot could not reach its configured total';
    end if;
  end loop;

  if v_pos <> v_expected then
    raise exception 'generated mock total does not match blueprint total';
  end if;

  return v_attempt;
end;
$$;

revoke execute on function public.generate_mock_attempt(uuid) from public, anon;
grant execute on function public.generate_mock_attempt(uuid) to authenticated;

commit;
