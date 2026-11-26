-- Jalankan di Supabase > SQL Editor (sekali saja)

create table if not exists public.nilai_siswa (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  module_id text not null,
  judul text,
  mapel text,
  skor int not null default 0,
  teks text,
  updated_at timestamptz not null default now(),
  unique (nama, module_id)
);

alter table public.nilai_siswa enable row level security;

drop policy if exists "nilai baca publik" on public.nilai_siswa;
create policy "nilai baca publik"
  on public.nilai_siswa for select
  to anon, authenticated
  using (true);

create or replace function public.simpan_nilai(
  p_nama text, p_module_id text, p_judul text, p_mapel text, p_skor int, p_teks text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.nilai_siswa (nama, module_id, judul, mapel, skor, teks, updated_at)
  values (trim(p_nama), p_module_id, p_judul, p_mapel, p_skor, p_teks, now())
  on conflict (nama, module_id) do update set
    skor = greatest(public.nilai_siswa.skor, excluded.skor),
    teks = excluded.teks,
    judul = excluded.judul,
    mapel = excluded.mapel,
    updated_at = now();
end;
$$;

grant execute on function public.simpan_nilai(text, text, text, text, int, text) to anon, authenticated;
