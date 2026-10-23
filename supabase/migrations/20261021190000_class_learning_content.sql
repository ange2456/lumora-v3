create table public.class_learning_content (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete restrict,
  content_type text not null check (content_type in ('activity', 'quiz')),
  title text not null check (char_length(title) between 1 and 100),
  instructions text not null default '' check (char_length(instructions) <= 2000),
  url text not null default '' check (
    char_length(url) <= 1000
    and (url = '' or url ~ '^https://')
  ),
  questions jsonb not null default '[]'::jsonb check (
    jsonb_typeof(questions) = 'array'
    and jsonb_array_length(questions) <= 20
  ),
  created_at timestamptz not null default now(),
  constraint class_learning_content_type_shape check (
    (content_type = 'activity' and jsonb_array_length(questions) = 0)
    or
    (content_type = 'quiz' and jsonb_array_length(questions) between 1 and 20)
  ),
  constraint class_learning_content_has_body check (
    content_type = 'quiz' or instructions <> '' or url <> ''
  )
);

create index class_learning_content_class_created_idx
  on public.class_learning_content (class_id, created_at);

alter table public.class_learning_content enable row level security;
revoke all on table public.class_learning_content from anon, authenticated;
grant select, insert, delete
  on table public.class_learning_content to authenticated;

create policy "teachers_read_own_class_learning_content"
  on public.class_learning_content for select to authenticated
  using (private.owns_class(class_id));

create policy "teachers_create_own_class_learning_content"
  on public.class_learning_content for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and private.owns_class(class_id)
    and exists (
      select 1
      from public.classes
      where id = class_id and archived = false
    )
  );

create policy "teachers_delete_own_class_learning_content"
  on public.class_learning_content for delete to authenticated
  using (
    private.owns_class(class_id)
    and exists (
      select 1
      from public.classes
      where id = class_id and archived = false
    )
  );
