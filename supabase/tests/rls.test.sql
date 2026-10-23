begin;

select plan(25);

insert into auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'student@example.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Student One","requested_role":"student"}',
    now(),
    now()
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'teacher@example.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Teacher One","requested_role":"teacher","institution":"Demo School","country_city":"Bogota","teacher_invite_code":"0123456789abcdef0123456789abcdef"}',
    now(),
    now()
  ),
  (
    '00000000-0000-4000-8000-000000000003',
    'authenticated',
    'authenticated',
    'student-two@example.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Student Two","requested_role":"student"}',
    now(),
    now()
  );

select lives_ok(
  $$insert into auth.users (
      id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    )
    values (
      '00000000-0000-4000-8000-000000000004',
      'authenticated', 'authenticated', 'teacher-no-invite@example.test', '',
      now(), '{"provider":"email","providers":["email"]}',
      '{"display_name":"Teacher Without Invite","requested_role":"teacher","institution":"Demo School","country_city":"Bogota"}',
      now(), now()
    )$$,
  'teacher accounts can register without an invitation'
);
select is(
  (select role::text from public.profiles
   where id = '00000000-0000-4000-8000-000000000004'),
  'teacher',
  'teacher registration immediately grants the teacher role'
);

insert into public.classes (
  id, teacher_id, name, subject, code, description
)
values (
  '00000000-0000-4000-8000-000000000010',
  '00000000-0000-4000-8000-000000000002',
  'Demo Class',
  'Matemáticas',
  'ABCDEFGHJKLM',
  'Weekly problem-solving activities.'
);

insert into public.class_resources (
  id, class_id, created_by, title, description, url
)
values (
  '00000000-0000-4000-8000-000000000020',
  '00000000-0000-4000-8000-000000000010',
  '00000000-0000-4000-8000-000000000002',
  'Study guide',
  'Review the lesson.',
  'https://example.test/guide'
);

insert into public.challenge_attempts (
  id,
  student_id,
  activity,
  activity_key,
  completed_at,
  total_questions,
  correct_answers,
  mistakes,
  reinforcement_successes,
  skill_results,
  completed,
  student_name,
  class_id,
  class_code
)
values (
  '00000000-0000-4000-8000-000000000030',
  '00000000-0000-4000-8000-000000000001',
  'Math challenge',
  'MATEMÁTICAS',
  now(),
  3,
  2,
  1,
  0,
  '[]'::jsonb,
  true,
  'Student One',
  '00000000-0000-4000-8000-000000000010',
  'ABCDEFGHJKLM'
);

insert into public.class_learning_content (
  id,
  class_id,
  created_by,
  content_type,
  title,
  questions
)
values (
  '00000000-0000-4000-8000-000000000040',
  '00000000-0000-4000-8000-000000000010',
  '00000000-0000-4000-8000-000000000002',
  'quiz',
  'Class quiz',
  '[{"prompt":"Question","options":["A","B","",""],"correctIndex":1,"explanation":"B is correct."}]'
);

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000004';
set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000004","role":"authenticated"}';
select lives_ok(
  $$insert into public.classes (teacher_id, name, subject, code)
    values (auth.uid(), 'Self Registered Teacher Class', 'Math', 'JKLMNPQRSTUV')$$,
  'a teacher who registered without an invite can create a class'
);
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}';

select is(
  (select count(*)::integer from public.profiles),
  1,
  'students can read only their own profile'
);
select is(
  (select count(*)::integer from public.challenge_attempts),
  1,
  'students can read their own progress'
);
select throws_ok(
  $$update public.profiles set role = 'teacher' where id = auth.uid()$$,
  '42501',
  null,
  'students cannot change their own profile role'
);
select lives_ok(
  $$select public.join_class_by_code('ABCDEFGHJKLM', 'Student One')$$,
  'students can join by a valid code'
);
select is(
  (select class_description
   from public.class_enrollments
   where class_id = '00000000-0000-4000-8000-000000000010'),
  'Weekly problem-solving activities.',
  'joining a class stores its description for the student view'
);
select is(
  (select count(*)::integer
   from public.class_members
   where class_id = '00000000-0000-4000-8000-000000000010'),
  1,
  'joining creates the class membership'
);
select is(
  (select count(*)::integer
   from public.class_resources
   where class_id = '00000000-0000-4000-8000-000000000010'),
  1,
  'class members can read resources'
);
select is(
  (select not (
      questions -> 0 ? 'correctIndex'
      or questions -> 0 ? 'explanation'
    )
   from public.get_student_class_content(
     '00000000-0000-4000-8000-000000000010'
   )
   where id = '00000000-0000-4000-8000-000000000040'),
  true,
  'students receive quiz questions without the answer key or explanation'
);
select is(
  public.submit_class_quiz(
    '00000000-0000-4000-8000-000000000040',
    array[1]
  ) ->> 'correctAnswers',
  '1',
  'students can submit answers and the database grades the quiz'
);
select is(
  (select feedback -> 0 ->> 'explanation'
   from public.get_student_class_content(
     '00000000-0000-4000-8000-000000000010'
   )
   where id = '00000000-0000-4000-8000-000000000040'),
  'B is correct.',
  'students can review the explanation after submitting the quiz'
);
select throws_ok(
  $$select public.submit_class_quiz(
      '00000000-0000-4000-8000-000000000040',
      array[0]
    )$$,
  '23505',
  null,
  'students cannot submit a second attempt for the same quiz'
);
select is(
  (select count(*)::integer
   from public.class_learning_content
   where class_id = '00000000-0000-4000-8000-000000000010'),
  0,
  'students cannot read teacher-only class activities or answer keys'
);
select throws_ok(
  $$insert into public.class_learning_content (
      class_id, created_by, content_type, title, questions
    )
    values (
      '00000000-0000-4000-8000-000000000010',
      auth.uid(),
      'quiz',
      'Forbidden quiz',
      '[{"prompt":"Question","options":["A","B","",""],"correctIndex":0}]'
    )$$,
  '42501',
  null,
  'students cannot create class activities or quizzes'
);
select throws_ok(
  $$insert into public.classes (teacher_id, name, subject, code)
    values (auth.uid(), 'Forbidden', 'Math', 'QWERTYUIOPAS')$$,
  '42501',
  null,
  'students cannot create classes'
);
reset role;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000003';
set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000003","role":"authenticated"}';
set local role authenticated;
select throws_ok(
  $$select * from public.get_student_class_content(
      '00000000-0000-4000-8000-000000000010'
    )$$,
  '42501',
  null,
  'students cannot read content from a class they have not joined'
);

reset role;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000002';
set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}';
set local role authenticated;

select is(
  (select count(*)::integer from public.challenge_attempts),
  1,
  'the class teacher can read enrolled student progress'
);
select is(
  (select count(*)::integer from public.class_quiz_attempts
   where class_id = '00000000-0000-4000-8000-000000000010'),
  1,
  'the class teacher can read students quiz results'
);
select is(
  (select count(*)::integer
   from public.class_members
   where class_id = '00000000-0000-4000-8000-000000000010'),
  1,
  'the class teacher can see their class roster'
);
select lives_ok(
  $$insert into public.class_resources (class_id, created_by, title, url)
    values (
      '00000000-0000-4000-8000-000000000010',
      auth.uid(),
      'Teacher resource',
      'https://example.test/teacher'
    )$$,
  'the class teacher can create a resource'
);
select lives_ok(
  $$insert into public.class_learning_content (
      class_id, created_by, content_type, title, questions
    )
    values (
      '00000000-0000-4000-8000-000000000010',
      auth.uid(),
      'quiz',
      'Teacher quiz',
      '[{"prompt":"Question","options":["A","B","",""],"correctIndex":0}]'
    )$$,
  'the class teacher can create a quiz'
);
update public.classes
set archived = true
where id = '00000000-0000-4000-8000-000000000010';
select throws_ok(
  $$insert into public.class_resources (class_id, created_by, title)
    values (
      '00000000-0000-4000-8000-000000000010',
      auth.uid(),
      'Archived class resource'
    )$$,
  '42501',
  null,
  'archived classes cannot receive new resources'
);
select throws_ok(
  $$insert into public.class_learning_content (
      class_id, created_by, content_type, title, questions
    )
    values (
      '00000000-0000-4000-8000-000000000010',
      auth.uid(),
      'quiz',
      'Archived quiz',
      '[{"prompt":"Question","options":["A","B","",""],"correctIndex":0}]'
    )$$,
  '42501',
  null,
  'archived classes cannot receive new quizzes'
);

select * from finish();
rollback;
