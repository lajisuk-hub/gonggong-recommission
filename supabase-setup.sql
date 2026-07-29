-- 국공립 신규위탁 참여신청 앱 저장공간 설정
-- (여러 앱이 함께 쓰는 Supabase라서 테이블 이름에 recom_ 을 붙여 겹치지 않게 했습니다)
-- Supabase 대시보드 > SQL Editor 에 아래 전체를 붙여넣고 [Run] 버튼을 누르세요.

-- 1) 설정 저장 테이블 (결제정보·일정이미지·과정안내·자료를 한 줄로 보관)
create table if not exists recom_settings (
  id text primary key,
  data jsonb,
  updated_at timestamptz default now()
);
alter table recom_settings enable row level security;
drop policy if exists "recom_settings read"   on recom_settings;
drop policy if exists "recom_settings insert" on recom_settings;
drop policy if exists "recom_settings update" on recom_settings;
create policy "recom_settings read"   on recom_settings for select using (true);
create policy "recom_settings insert" on recom_settings for insert with check (true);
create policy "recom_settings update" on recom_settings for update using (true);

-- 2) 신청 내역 테이블
create table if not exists recom_applications (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  current_region text,
  target_region text,
  career text,
  challenge_count text,
  help_needed text,
  payment_method text,
  einvoice_email text,
  business_reg_url text,
  paid_date text,
  scheduled_date text,
  payment_status text default '대기',
  created_at timestamptz default now()
);
alter table recom_applications enable row level security;
drop policy if exists "recom_app read"   on recom_applications;
drop policy if exists "recom_app insert" on recom_applications;
drop policy if exists "recom_app update" on recom_applications;
create policy "recom_app read"   on recom_applications for select using (true);
create policy "recom_app insert" on recom_applications for insert with check (true);
create policy "recom_app update" on recom_applications for update using (true);

-- 3) 사진/파일 저장 버킷 (일정 이미지·고유번호증·교육자료)
insert into storage.buckets (id, name, public)
values ('recommission', 'recommission', true)
on conflict (id) do nothing;

drop policy if exists "recom read"   on storage.objects;
drop policy if exists "recom upload" on storage.objects;
create policy "recom read"   on storage.objects for select using (bucket_id = 'recommission');
create policy "recom upload" on storage.objects for insert with check (bucket_id = 'recommission');
