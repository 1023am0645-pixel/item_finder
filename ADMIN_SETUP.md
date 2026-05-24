# 물건어디 관리자 기능 설정 메모

이 기능은 사용자가 쓰는 GitHub Pages 화면에는 비밀키를 넣지 않고, Supabase Edge Function에서만 관리자 권한을 사용하도록 설계했습니다.

## 1. 사용자 문의 방식

앱 설정에 `7. 문의하기`가 추가됩니다.

- `물건어디 카카오톡 고객센터`: 설정한 카카오톡 채널 1:1 채팅 URL로 이동합니다.

카카오톡 채널 1:1 채팅 URL이나 전용 챗봇 링크를 만들면 `js/firebase-sync.js` 상단의 아래 값에 링크를 넣으면 됩니다.

```js
const SUPPORT_KAKAO_CUSTOMER_CENTER_URL = 'https://pf.kakao.com/_RexmbX/chat';
const SUPPORT_CHATBOT_URL = '';
```

추천 운영 방식은 `카카오톡 채널 1:1 채팅`을 고객센터로 쓰는 방식입니다. 오픈채팅방보다 개인 상담 흐름이 자연스럽고, 채팅 가능 시간과 안내 메시지를 설정할 수 있습니다.

### 카카오톡 채널 1:1 채팅 만들기

1. 카카오톡 채널 관리자센터에서 `물건어디` 채널을 개설합니다.
2. 채널 관리자센터에서 해당 채널 선택 후 `1:1 채팅` 메뉴로 이동합니다.
3. 개인정보 보호를 위한 관리자 추가인증을 진행합니다.
4. `1:1 채팅 > 채팅 설정`에서 1:1 채팅을 켜고, 상담 가능 요일/시간과 채팅 불가능 안내 메시지를 설정합니다.
5. 채널의 `채팅 URL`을 복사합니다.
6. 복사한 URL을 `js/firebase-sync.js`의 `SUPPORT_KAKAO_CUSTOMER_CENTER_URL`에 넣습니다.

## 2. 접속 기록 테이블 만들기

Supabase Dashboard > SQL Editor에서 `supabase/item_finder_admin_setup.sql` 내용을 1회 실행합니다.

이 SQL은 `usage_events` 테이블을 만들고, 앱에서는 `INSERT`만 허용합니다. 사용자가 브라우저에서 다른 사람의 접속 기록을 조회하지 못하도록 `SELECT` 정책은 만들지 않습니다.

## 3. 관리자 Edge Function 배포

관리자 페이지는 `developer.html`입니다. 이 페이지는 아래 Edge Function이 배포되어야 동작합니다.

```bash
supabase functions deploy item-finder-admin
```

Supabase Secrets에는 아래 값을 넣습니다.

```bash
supabase secrets set ITEM_FINDER_ADMIN_TOKEN="본인만 아는 긴 관리자 토큰"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="Supabase service_role 또는 secret key"
supabase secrets set SUPABASE_URL="https://koddftotebkjomwmauly.supabase.co"
```

관리자 토큰은 최소 20자 이상으로 만들고, 카카오톡이나 문서에 그대로 공유하지 않는 편이 좋습니다.

## 4. 개발자 페이지에서 가능한 일

- 기록된 사용자 수 확인
- 최근 접속 사용자와 접속 시각 확인
- 로그인 이벤트 수 확인
- 서버의 그룹 데이터, 사용자-그룹 연결, 접속 이벤트를 암호화 백업 파일로 다운로드

암호화 백업은 브라우저에서 입력한 비밀번호로 AES-GCM 방식으로 암호화합니다. 비밀번호는 저장하지 않으므로 잃어버리면 복구할 수 없습니다.

## 5. 주의할 점

GitHub Pages는 정적 웹사이트라서 `비밀번호만 걸린 관리자 페이지`를 안전하게 만들 수 없습니다. HTML과 JS는 누구나 볼 수 있기 때문입니다. 전체 데이터 조회와 백업은 반드시 Edge Function처럼 서버 쪽에서 관리자 토큰을 확인한 뒤 처리해야 합니다.
