-- Workday Journey V8.4.5 - Project File Vault
-- Run this ONCE in Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Safe to run again: the table/indexes/bucket are idempotent and policies are recreated.

create table if not exists public.project_file_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id text not null,
  logical_name text not null,
  version integer not null check (version > 0),
  storage_path text not null unique,
  file_size bigint not null check (file_size >= 0 and file_size <= 20971520),
  mime_type text,
  created_at timestamptz not null default now(),
  constraint project_file_versions_name_len check (char_length(logical_name) between 1 and 180),
  constraint project_file_versions_unique_version unique (user_id, project_id, logical_name, version)
);

create index if not exists project_file_versions_user_project_idx
  on public.project_file_versions (user_id, project_id, created_at desc);
create index if not exists project_file_versions_user_name_idx
  on public.project_file_versions (user_id, project_id, logical_name, version desc);

alter table public.project_file_versions enable row level security;

revoke all on public.project_file_versions from anon;
grant select, insert, update, delete on public.project_file_versions to authenticated;

drop policy if exists "project_file_versions_select_own" on public.project_file_versions;
create policy "project_file_versions_select_own"
  on public.project_file_versions for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "project_file_versions_insert_own" on public.project_file_versions;
create policy "project_file_versions_insert_own"
  on public.project_file_versions for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "project_file_versions_update_own" on public.project_file_versions;
create policy "project_file_versions_update_own"
  on public.project_file_versions for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "project_file_versions_delete_own" on public.project_file_versions;
create policy "project_file_versions_delete_own"
  on public.project_file_versions for delete to authenticated
  using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit)
values ('project-files', 'project-files', false, 20971520)
on conflict (id) do update
set public = false,
    file_size_limit = 20971520;

-- Storage object paths are: <auth.uid()>/<project_id>/<versioned filename>
-- The first folder is therefore enough to enforce per-user privacy.
drop policy if exists "project_files_select_own" on storage.objects;
create policy "project_files_select_own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "project_files_insert_own" on storage.objects;
create policy "project_files_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "project_files_update_own" on storage.objects;
create policy "project_files_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "project_files_delete_own" on storage.objects;
create policy "project_files_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
