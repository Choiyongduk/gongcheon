-- =====================================================================
--  자유와혁신 공천관리위원회 앱 — Supabase 스키마 + 시드
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.
-- =====================================================================

-- ---------- profiles (사용자 권한) ----------
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  name text,
  role text default 'member',          -- 'admin' | 'member'
  status text default 'pending',        -- 'approved' | 'pending'
  created_at timestamptz default now()
);

-- 신규 가입 시 profiles 자동 생성
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name) values (new.id, new.raw_user_meta_data->>'name');
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- 콘텐츠 테이블 ----------
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null, role text, org text, note text,
  lead boolean default false, sort int default 100
);

create table if not exists notices (
  id uuid primary key default gen_random_uuid(),
  category text default '안내', title text not null, body text,
  pinned boolean default false,
  attachments jsonb default '[]', created_at date default now()
);

create table if not exists rules (
  id uuid primary key default gen_random_uuid(),
  no text, title text, body text, sort int default 100
);

create table if not exists minutes (
  id uuid primary key default gen_random_uuid(),
  round int, title text, date date, place text, quorum text,
  agenda jsonb default '[]', decided text,
  attachments jsonb default '[]'
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  name text not null, filetype text, size text, url text,
  created_at date default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null, date date, phase text default 'upcoming', kind text default 'milestone'
);

create table if not exists suggestions (
  id uuid primary key default gen_random_uuid(),
  category text, body text not null, status text default '검토중',
  attachments jsonb default '[]',
  created_at timestamptz default now()
);

-- ---------- RLS ----------
alter table profiles    enable row level security;
alter table members     enable row level security;
alter table notices     enable row level security;
alter table rules       enable row level security;
alter table minutes     enable row level security;
alter table documents   enable row level security;
alter table events      enable row level security;
alter table suggestions enable row level security;

-- 읽기: 누구나 (앱은 내부 배포 가정). 더 엄격히 하려면 auth.uid() is not null 로 변경.
create policy "read_all" on members     for select using (true);
create policy "read_all" on notices     for select using (true);
create policy "read_all" on rules       for select using (true);
create policy "read_all" on minutes     for select using (true);
create policy "read_all" on documents   for select using (true);
create policy "read_all" on events      for select using (true);
create policy "read_all" on suggestions for select using (true);

-- profiles: 본인만 읽기
create policy "own_profile" on profiles for select using (auth.uid() = id);

-- 개선의견: 누구나 등록
create policy "insert_suggestion" on suggestions for insert with check (true);

-- 관리자 쓰기 권한 (admin role)
create or replace function is_admin() returns boolean language sql stable as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

do $$ declare t text;
begin
  foreach t in array array['members','notices','rules','minutes','documents','events','suggestions']
  loop
    execute format('create policy "admin_write" on %I for all using (is_admin()) with check (is_admin());', t);
  end loop;
end $$;

-- =====================================================================
--  시드 데이터 (실제 회의록 기반)
-- =====================================================================
insert into members (name, role, org, note, lead, sort) values
  ('정해훈','위원장','공천관리위원회','위원회 총괄',true,1),
  ('강익현','부위원장','정책위의장 겸직','위원장 직무대행',false,2),
  ('김영일','위원','','',false,3),
  ('천규승','위원','','',false,4),
  ('위금숙','위원','','',false,5),
  ('차훈','위원','','',false,6),
  ('한성학','위원','','',false,7),
  ('윤태준','위원','','',false,8),
  ('최용덕','간사','의결권 없음','회의 기록·실무 총괄',false,9);

insert into notices (category, title, body, pinned, created_at) values
  ('성명','6·3 지방선거 공천 방향과 원칙에 관한 공천관리위원회 성명',
   E'자유와혁신 공천관리위원회는 6·3 지방선거를 앞두고 공천의 방향과 원칙을 분명히 밝힙니다.\n\n이번 지방선거는 지역의 행정과 재정을 책임 있게 감시하고, 자유민주주의와 헌정질서를 지역 현장에서 지켜낼 일꾼을 세우는 선거입니다. 우리는 전국 모든 선거구에 후보를 배출하는 것을 목표로 공천 절차를 추진합니다.\n\n공천은 특정 계층이 아니라 뜻을 함께하는 당원 누구에게나 열려 있습니다. 중요한 것은 경력의 외형이 아니라 대한민국을 바로 세우겠다는 의지와 책임 있게 일하겠다는 자세입니다. 우리는 자유의 가치를 정책과 감시, 대안과 책임으로 실현할 후보를 추천하겠습니다.',
   true,'2026-04-04'),
  ('공고','제9회 전국동시지방선거 공직후보자 공모 공고',
   E'공천관리위원회는 제9회 전국동시지방선거 공직후보자를 공개모집합니다.\n\n· 대상: 광역·기초단체장 및 광역·기초의원\n· 접수: 자료실의 신청서 양식 제출\n· 자격: 당원으로서 피선거권을 갖춘 자\n\n세부 자격요건과 제출서류는 자료실의 「공모 안내문」을 확인하시기 바랍니다.',
   false,'2026-03-20'),
  ('안내','공천 신청 서류 보완 요청 안내',
   E'접수분 중 서류 미비 건에 대해 개별 보완을 요청드립니다. 보완 기한은 통지일로부터 정해진 기일 이내이며, 기한 내 미제출 시 심사에서 제외될 수 있습니다. 시·도당 위원장께서는 후보 서류 완비에 협조해 주시기 바랍니다.',
   false,'2026-04-17'),
  ('안내','공천관리위원회 구성 및 활동 개시 안내',
   E'최고위원회 의결에 따라 제9회 지방선거 공천관리위원회를 구성하고 활동을 개시합니다. 위원회는 재적 8인의 위원과 의결권 없는 간사로 구성되며, 공정성·투명성·전문성을 원칙으로 업무를 수행합니다.',
   false,'2026-02-26');

insert into rules (no, title, body, sort) values
  ('제1조','목적','이 규정은 자유와혁신의 공직선거 후보자 추천(이하 “공천”)을 공정하고 투명하게 관리하기 위하여 공천관리위원회의 구성과 운영, 심사 기준 및 절차에 관한 사항을 규정함을 목적으로 한다.',1),
  ('제2조','기본원칙','공천은 ① 공정성 ② 투명성 ③ 전문성 ④ 당원·국민의 참여를 기본원칙으로 한다. 위원회는 특정 계파·개인의 이익이 아닌 당의 가치와 공익에 부합하는 후보자를 추천한다.',2),
  ('제3조','위원회의 구성','위원회는 위원장 1인, 부위원장 1인을 포함한 재적 8인의 위원으로 구성하며, 회의 기록과 실무를 담당하는 간사 1인을 둔다. 간사는 의결권을 가지지 아니한다.',3),
  ('제4조','공천 절차','공천은 ① 공모·접수 ② 서류심사 ③ 면접심사 ④ 위원회 의결의 순서로 진행한다. 서류심사는 합격·불합격(합/불) 방식으로 판정하며, 면접심사를 거쳐 위원회 의결로 확정한다.',4),
  ('제5조','심사 기준','심사는 별도의 정량 배점을 두지 아니한다. 서류심사는 자격요건을 체크리스트로 확인하고, 면접심사는 실천 역량·지역 현안 이해·소통 능력을 종합하여 합/불로 판정한다. 여성·청년에 대한 별도의 우대 쿼터는 두지 아니한다.',5),
  ('제6조','부적격 배제','당헌·당규를 위반하거나, 중대한 도덕적 흠결이 있거나, 관련 법령에 따른 피선거권이 없는 자는 공천에서 배제한다.',6),
  ('제7조','의결 방식','회의는 재적위원 과반수의 출석으로 개의하고, 출석위원 과반수의 찬성으로 의결한다. 가부동수인 경우 위원장이 결정한다. 위원장이 직무를 수행할 수 없을 때에는 부위원장이 그 직무를 대행한다.',7),
  ('제8조','이의제기','공천 결과에 이의가 있는 신청자는 결과 통보일로부터 정해진 기한 내에 서면으로 이의를 제기할 수 있다. 이의제기는 절차상 하자 또는 명백한 사실 오인에 한하며, 위원회가 1차 심사하고 재심은 최고위원회가 최종 결정한다.',8);

insert into minutes (round, title, date, place, quorum, agenda, decided) values
  (1,'제1차 공천관리위원회 회의','2026-02-23','중앙당 회의실','재적 8인 중 8인 출석',
   '["위원회 구성 및 운영 방향","공천 운영세칙 검토 착수"]',
   '위원 구성을 확인하고 운영세칙 마련에 착수하기로 함. 세부 심사 방식은 차기 회의에서 의결.'),
  (2,'제2차 공천관리위원회 회의','2026-02-26','중앙당 회의실','재적 8인 중 7인 출석',
   '["공천 운영세칙 의결","여성·청년 우대 여부","심사료 감면 여부","부위원장·간사 선임"]',
   '① 운영세칙 채택, 서류심사 합/불 방식 의결 ② 여성·청년 별도 특혜 없음 ③ 심사료 감면 부결 ④ 부위원장 강익현(정책위의장), 의결권 없는 간사 최용덕 선임'),
  (3,'제3차 공천관리위원회 회의','2026-03-10','온라인 화상회의','재적 8인 중 7인 출석',
   '["서류심사 기준 검토","이의제기 절차 마련"]',
   '서류심사 체크리스트 채택. 이의제기는 절차 하자·사실 오인에 한정하고 재심은 최고위원회가 결정.'),
  (4,'제4차 공천관리위원회 회의','2026-03-24','중앙당 대회의실','재적 8인 중 8인 출석',
   '["공천 성명서 발표 및 TF 구성","후보 서류심사 진행 방안","동일 지역구 복수 후보 처리","1차 심사 결과 최고위 전달·예비후보 등록 안내","선거상황실·홍보물·캠프 웹페이지 구축"]',
   '① 성명서 발표 및 TF팀 구성 만장일치 가결 ② 서류심사 차주 진행 ③ 동일 지역구 복수 후보 처리 기준 수립 ④ 1차 결과 최고위 전달·예비후보 등록 안내 ⑤ 선거상황실·홍보·캠프 웹 구축 추진'),
  (5,'제5차 공천관리위원회 회의','2026-04-16','중앙당 대회의실','재적 8인 중 7인 출석',
   '["광역 시·도당 1차 심사권 이양","영상(화상) 면접 도입","선거자금 조달 방안"]',
   '① 시·도당 심사권 이양 보류(추천 후보 심사 우선권 검토) ② 영상 면접 조건부 통과(시기·방법은 집행부 결정) ③ 선거자금은 보고서 작성 후 대표 보고로 방향 확정');

insert into documents (name, filetype, size, url, created_at) values
  ('공직후보자 공모 안내문','PDF','412 KB','#','2026-03-20'),
  ('공천 신청서 양식','HWP','88 KB','#','2026-03-20'),
  ('공천관리위원회 운영 규정','PDF','256 KB','#','2026-03-17'),
  ('후보자 서약서 양식','HWP','54 KB','#','2026-03-20'),
  ('서류심사 체크리스트','PDF','176 KB','#','2026-03-10'),
  ('공천관리위원회 성명서','PDF','132 KB','#','2026-04-04');

insert into events (title, date, phase, kind) values
  ('위원회 구성·활동 개시','2026-02-23','done','milestone'),
  ('운영세칙 의결','2026-02-26','done','meeting'),
  ('공천 성명서 발표','2026-04-04','done','milestone'),
  ('공직후보자 공모·접수','2026-04-07','done','process'),
  ('서류심사','2026-04-21','done','process'),
  ('면접심사','2026-05-02','done','process'),
  ('1차 공천 명단 발표','2026-05-08','done','milestone'),
  ('후보 등록 마감','2026-05-15','done','milestone'),
  ('제9회 전국동시지방선거','2026-06-03','upcoming','election');

insert into suggestions (category, body, status, created_at) values
  ('절차','면접 일정을 더 일찍 공지해 주시면 후보들이 준비하기 좋겠습니다.','검토중','2026-04-18');

-- =====================================================================
--  [업데이트] 첨부 파일 / Storage 설정
--  이미 위 스키마를 실행한 프로젝트는 아래 블록만 추가로 실행하면 됩니다.
-- =====================================================================

-- 1) 공지 / 회의록에 첨부(사진·파일·영상·유튜브) 컬럼 추가
alter table notices add column if not exists attachments jsonb default '[]';
alter table minutes add column if not exists attachments jsonb default '[]';

-- 2) Storage 버킷 생성 (공개 읽기)
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- 3) Storage 접근 정책
--    읽기: 누구나 / 업로드·수정·삭제: 관리자(admin)만
drop policy if exists "media_read"   on storage.objects;
drop policy if exists "media_write"  on storage.objects;
drop policy if exists "media_update" on storage.objects;
drop policy if exists "media_delete" on storage.objects;

create policy "media_read" on storage.objects
  for select using (bucket_id = 'media');

create policy "media_write" on storage.objects
  for insert with check (bucket_id = 'media' and is_admin());

create policy "media_update" on storage.objects
  for update using (bucket_id = 'media' and is_admin());

create policy "media_delete" on storage.objects
  for delete using (bucket_id = 'media' and is_admin());

-- =====================================================================
--  [업데이트 2] 로그인 사용자 작성 권한 + 개선의견 첨부
--  이미 스키마를 실행한 프로젝트는 이 블록을 추가로 실행하세요.
-- =====================================================================

-- 개선의견 첨부 컬럼
alter table suggestions add column if not exists attachments jsonb default '[]';

-- 공지/회의록/자료실/개선의견: 로그인(authenticated) 사용자면 작성·수정·삭제 가능
--  (위원/규칙/일정은 기존 admin 전용 정책 유지)
do $$ declare t text;
begin
  foreach t in array array['notices','minutes','documents','suggestions']
  loop
    execute format('drop policy if exists "auth_write" on %I;', t);
    execute format('create policy "auth_write" on %I for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;

-- Storage 업로드 권한: 관리자 전용 -> 로그인 사용자 누구나 (유튜브 링크는 업로드 불필요)
drop policy if exists "media_write"  on storage.objects;
drop policy if exists "media_update" on storage.objects;
drop policy if exists "media_delete" on storage.objects;

create policy "media_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');
create policy "media_update" on storage.objects
  for update to authenticated using (bucket_id = 'media');
create policy "media_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media');

-- =====================================================================
--  [업데이트 3] 개선의견 등록도 로그인 필요
--  "누구나 등록" 정책을 제거합니다. (읽기는 누구나 그대로 유지)
--  로그인 사용자의 등록·수정은 [업데이트 2]의 auth_write 정책이 처리합니다.
-- =====================================================================
drop policy if exists "insert_suggestion" on suggestions;
