-- 물건어디 동기화 테이블/권한 복구 SQL
-- Supabase Dashboard > SQL Editor에서 실행하세요.
-- 목적: 앱이 groups/user_groups 테이블을 읽고 쓸 수 있도록 기본 구조와 정책을 재정비합니다.

create table if not exists public.groups (
    group_id text primary key,
    items jsonb default '[]'::jsonb,
    rooms jsonb default '{"list":[],"zones":{}}'::jsonb,
    backups jsonb default '[]'::jsonb,
    theme text default 'light',
    updated_at timestamptz not null default now()
);

create table if not exists public.user_groups (
    user_id text primary key,
    group_id text not null,
    nickname text default '회원',
    joined_at timestamptz not null default now()
);

create table if not exists public.invite_codes (
    code text primary key,
    group_id text not null,
    created_by text,
    expires_at timestamptz not null,
    created_at timestamptz not null default now()
);

create index if not exists groups_updated_at_idx on public.groups (updated_at desc);
create index if not exists user_groups_group_id_idx on public.user_groups (group_id);
create index if not exists invite_codes_group_id_idx on public.invite_codes (group_id);
create index if not exists invite_codes_expires_at_idx on public.invite_codes (expires_at);

alter table public.groups enable row level security;
alter table public.user_groups enable row level security;
alter table public.invite_codes enable row level security;

drop policy if exists "groups read from app" on public.groups;
create policy "groups read from app"
on public.groups
for select
to anon
using (true);

drop policy if exists "groups insert from app" on public.groups;
create policy "groups insert from app"
on public.groups
for insert
to anon
with check (true);

drop policy if exists "groups update from app" on public.groups;
create policy "groups update from app"
on public.groups
for update
to anon
using (true)
with check (true);

drop policy if exists "user groups read from app" on public.user_groups;
create policy "user groups read from app"
on public.user_groups
for select
to anon
using (true);

drop policy if exists "user groups insert from app" on public.user_groups;
create policy "user groups insert from app"
on public.user_groups
for insert
to anon
with check (true);

drop policy if exists "user groups update from app" on public.user_groups;
create policy "user groups update from app"
on public.user_groups
for update
to anon
using (true)
with check (true);

drop policy if exists "user groups delete from app" on public.user_groups;
create policy "user groups delete from app"
on public.user_groups
for delete
to anon
using (true);

drop policy if exists "invite codes read from app" on public.invite_codes;
create policy "invite codes read from app"
on public.invite_codes
for select
to anon
using (true);

drop policy if exists "invite codes insert from app" on public.invite_codes;
create policy "invite codes insert from app"
on public.invite_codes
for insert
to anon
with check (true);
