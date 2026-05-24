# 자유와혁신 공천관리위원회 앱

React + Vite + Supabase 기반의 위원회 내부용 모바일 웹앱(PWA)입니다.
홈 · 공지 · 일정 · 회의·자료 · 위원회(위원·규칙·개선의견) 구조로 구성되며,
관리자 모드에서 모든 콘텐츠를 직접 등록·수정·삭제할 수 있습니다.

> Supabase를 연결하지 않아도 번들된 시드 데이터로 바로 실행됩니다.
> 실제 운영을 위해서는 아래 절차대로 Supabase를 연결하세요.

## 1. 설치 · 실행

```bash
npm install
npm run dev        # 개발 서버 (http://localhost:5173)
npm run build      # 배포 빌드 (dist/)
npm run preview    # 빌드 결과 미리보기
```

## 2. Supabase 연결

1. supabase.com 에서 새 프로젝트를 만듭니다.
2. 대시보드 > SQL Editor 에서 `supabase-schema.sql` 전체를 붙여넣고 실행합니다.
   (테이블·권한·실제 회의록 기반 시드 데이터가 함께 생성됩니다.)
3. 대시보드 > Project Settings > API 에서 `Project URL` 과 `anon public` 키를 복사합니다.
4. `.env.example` 을 복사해 `.env` 파일을 만들고 값을 채웁니다.

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhb...
```

## 3. 첫 관리자 계정 만들기

1. 앱에서 [위원회 > 위원·운영자 로그인 > 회원가입] 으로 계정을 만듭니다.
2. Supabase 대시보드 > Table Editor > `profiles` 에서 해당 사용자의
   `role` 을 `admin`, `status` 를 `approved` 로 변경합니다.
3. 다시 로그인하면 [위원회 > 관리자] 메뉴에서 공지·회의록·일정·자료·위원·규칙을
   직접 관리할 수 있습니다.

## 4. 배포 (Netlify 예시)

- 빌드 명령: `npm run build`
- 배포 디렉토리: `dist`
- 환경변수: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 등록
- SPA 라우팅을 위해 `dist/_redirects` 또는 `netlify.toml` 에
  `/* /index.html 200` 규칙을 추가하세요.

## 데이터 출처

위원 구성, 규칙, 회의록(1~5차), 공천 일정, 성명서 등은 위원회의 실제
회의록·운영자료를 바탕으로 입력되어 있습니다. 운영자가 관리자 모드에서
언제든 갱신할 수 있습니다.

## 디자인

- 색상: RED `#A50034` · NAVY `#051C4C` · WARM PAPER `#FBFAF2`, 골드 헤어라인 포인트
- 글꼴: 제목 Noto Serif KR / 본문 Pretendard
- 네이비 면의 은은한 광택(sheen)과 골드 헤어라인으로 고급스러운 톤을 구현
- 아이콘은 전부 라인 SVG (이모티콘 미사용)
