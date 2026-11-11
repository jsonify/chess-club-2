-- Teachers that students can be assigned to.
-- students.teacher stays a text column holding the teacher's name, so existing
-- rows keep working; renaming a teacher in the app also updates those rows.
create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

alter table public.teachers enable row level security;

drop policy if exists "Signed-in users can manage teachers" on public.teachers;
create policy "Signed-in users can manage teachers"
  on public.teachers
  for all
  to authenticated
  using (true)
  with check (true);

-- Seed with the list that used to be hard-coded in StudentInfo.jsx.
insert into public.teachers (name) values
  ('Alderson'), ('Bonnell'), ('Chapin'), ('Chase'), ('DeLoma'),
  ('Gregerson'), ('Hanson'), ('Holt'), ('Larson'), ('Mindt'),
  ('Otterlee'), ('Parsons'), ('Pawling'), ('Unruh'), ('Wildenhaus')
on conflict (name) do nothing;
