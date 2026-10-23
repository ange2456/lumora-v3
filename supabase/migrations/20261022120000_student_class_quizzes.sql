create table public.class_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.class_learning_content (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  answers jsonb not null check (jsonb_typeof(answers) = 'array'),
  correct_answers integer not null check (correct_answers >= 0),
  total_questions integer not null check (total_questions between 1 and 20),
  completed_at timestamptz not null default now(),
  unique (quiz_id, student_id),
  check (correct_answers <= total_questions)
);

create index class_quiz_attempts_class_student_idx
  on public.class_quiz_attempts (class_id, student_id, completed_at desc);

alter table public.class_quiz_attempts enable row level security;
revoke all on table public.class_quiz_attempts from anon, authenticated;
grant select on table public.class_quiz_attempts to authenticated;

create policy "students_and_teachers_read_class_quiz_attempts"
  on public.class_quiz_attempts for select to authenticated
  using (
    student_id = (select auth.uid())
    or private.owns_class(class_id)
  );

create function public.get_student_class_content(input_class_id uuid)
returns table (
  id uuid,
  content_type text,
  title text,
  instructions text,
  url text,
  questions jsonb,
  completed boolean,
  correct_answers integer,
  total_questions integer,
  feedback jsonb
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'student'
  ) or not private.is_class_member(input_class_id) then
    raise exception 'No tienes acceso al contenido de esta clase.'
      using errcode = '42501';
  end if;

  return query
  select
    content.id,
    content.content_type,
    content.title,
    content.instructions,
    content.url,
    case
      when content.content_type = 'quiz' then (
        select coalesce(
          jsonb_agg(
            question.value - 'correctIndex' - 'explanation'
            order by question.ordinality
          ),
          '[]'::jsonb
        )
        from jsonb_array_elements(content.questions)
          with ordinality as question(value, ordinality)
      )
      else '[]'::jsonb
    end,
    attempt.id is not null,
    coalesce(attempt.correct_answers, 0),
    coalesce(attempt.total_questions, jsonb_array_length(content.questions)),
    case
      when attempt.id is null then '[]'::jsonb
      else (
        select coalesce(
          jsonb_agg(
            jsonb_build_object(
              'prompt', question.value ->> 'prompt',
              'options', question.value -> 'options',
              'correctIndex', (question.value ->> 'correctIndex')::integer,
              'selectedIndex',
                (attempt.answers ->> (question.ordinality - 1)::integer)::integer,
              'explanation', coalesce(question.value ->> 'explanation', '')
            )
            order by question.ordinality
          ),
          '[]'::jsonb
        )
        from jsonb_array_elements(content.questions)
          with ordinality as question(value, ordinality)
      )
    end
  from public.class_learning_content as content
  left join public.class_quiz_attempts as attempt
    on attempt.quiz_id = content.id
    and attempt.student_id = auth.uid()
  where content.class_id = input_class_id
  order by content.created_at;
end;
$$;

create function public.submit_class_quiz(
  input_quiz_id uuid,
  input_answers integer[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  active_user_id uuid := auth.uid();
  target_quiz public.class_learning_content%rowtype;
  question_count integer;
  answer_count integer;
  correct_count integer := 0;
  question_index integer;
  correct_index integer;
  feedback jsonb := '[]'::jsonb;
  saved_attempt public.class_quiz_attempts%rowtype;
begin
  if active_user_id is null or not exists (
    select 1 from public.profiles
    where id = active_user_id and role = 'student'
  ) then
    raise exception 'Inicia sesión con una cuenta de estudiante.'
      using errcode = '42501';
  end if;

  select content.*
  into target_quiz
  from public.class_learning_content as content
  where content.id = input_quiz_id
    and content.content_type = 'quiz';

  if not found or not private.is_class_member(target_quiz.class_id, active_user_id) then
    raise exception 'No encontramos un reto disponible en una de tus clases.'
      using errcode = '42501';
  end if;

  question_count := jsonb_array_length(target_quiz.questions);
  answer_count := coalesce(array_length(input_answers, 1), 0);

  if answer_count <> question_count then
    raise exception 'Responde todas las preguntas antes de enviar el reto.'
      using errcode = '22023';
  end if;

  for question_index in 0..question_count - 1 loop
    if input_answers[question_index + 1] is null
      or input_answers[question_index + 1] < 0
      or input_answers[question_index + 1] > 3
      or target_quiz.questions -> question_index -> 'options'
        -> input_answers[question_index + 1] = '""'::jsonb then
      raise exception 'Una de las respuestas no es válida.'
        using errcode = '22023';
    end if;

    correct_index := (target_quiz.questions -> question_index ->> 'correctIndex')::integer;
    if input_answers[question_index + 1] = correct_index then
      correct_count := correct_count + 1;
    end if;

    feedback := feedback || jsonb_build_array(
      jsonb_build_object(
        'prompt', target_quiz.questions -> question_index ->> 'prompt',
        'options', target_quiz.questions -> question_index -> 'options',
        'correctIndex', correct_index,
        'selectedIndex', input_answers[question_index + 1],
        'explanation', coalesce(
          target_quiz.questions -> question_index ->> 'explanation',
          ''
        )
      )
    );
  end loop;

  insert into public.class_quiz_attempts (
    quiz_id,
    class_id,
    student_id,
    answers,
    correct_answers,
    total_questions
  )
  values (
    target_quiz.id,
    target_quiz.class_id,
    active_user_id,
    to_jsonb(input_answers),
    correct_count,
    question_count
  )
  returning * into saved_attempt;

  return jsonb_build_object(
    'id', saved_attempt.id,
    'correctAnswers', saved_attempt.correct_answers,
    'totalQuestions', saved_attempt.total_questions,
    'completedAt', saved_attempt.completed_at,
    'feedback', feedback
  );
end;
$$;

revoke all on function public.get_student_class_content(uuid) from public, anon;
revoke all on function public.submit_class_quiz(uuid, integer[]) from public, anon;
grant execute on function public.get_student_class_content(uuid) to authenticated;
grant execute on function public.submit_class_quiz(uuid, integer[]) to authenticated;
