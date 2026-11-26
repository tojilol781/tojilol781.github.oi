-- Jalankan di Supabase > SQL Editor (sekali saja)
-- Materi dan versi reset disimpan di sini. Siswa hanya bisa membaca.
-- Penulisan dilakukan server (index.js) memakai service_role key.

create table if not exists public.pengaturan_app (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.pengaturan_app enable row level security;

drop policy if exists "pengaturan baca publik" on public.pengaturan_app;
create policy "pengaturan baca publik"
  on public.pengaturan_app for select
  to anon, authenticated
  using (true);

insert into public.pengaturan_app (key, value)
values ('reset', '{"version": 1}'::jsonb)
on conflict (key) do nothing;
