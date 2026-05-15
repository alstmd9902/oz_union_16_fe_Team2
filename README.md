# 작심며칠

> 목표를 만들고 매일 인증하며, 목표 달성 과정을 게시글과 투표로 공유하는 커뮤니티 기반 습관 관리 서비스입니다.

## 배포 링크

[서비스 바로가기](https://oz-union-16-fe-team2.vercel.app/)

### 데모 계정 / Mock API 안내

이 프로젝트는 포트폴리오 시연을 위해 MSW(Mock Service Worker) 기반의 Mock API를 사용합니다. 로그인, 회원가입, 이메일 인증, 닉네임 중복 확인, 프로필 조회는 실제 서버가 아닌 브라우저 내 Mock 데이터로 동작합니다.

- 데모 계정: `test@example.com` / `password123`
- 이메일 인증번호 확인은 임의의 값을 입력해도 성공 처리됩니다.
- 회원가입, 목표, 게시글, 댓글 정보는 실제 서버나 DB에 저장되지 않습니다.
- 목표 생성/수정/삭제/체크, 게시글 작성/삭제/좋아요/북마크, 댓글 작성/수정/삭제/좋아요는 현재 브라우저 세션의 Mock 데이터에 반영됩니다.
- Mock 데이터는 새로고침 또는 로그아웃 시 초기화되며, 목표와 게시글은 각각 최대 20개까지만 유지됩니다.

## 프로젝트 개요

작심며칠은 사용자가 개인 목표를 설정하고 일별 체크 기록을 남길 수 있는 서비스입니다. 사용자는 목표와 연결된 게시글을 작성하고, 댓글/좋아요/스크랩/투표 기능을 통해 다른 사용자와 목표 달성 경험을 공유할 수 있습니다.

## ✨ 주요 기능

## 회원가입 / 내정보 변경

- 닉네임 중복 확인
- 이메일 인증
- 프로필 이미지 선택
- 내정보 변경

|                                    회원가입                                    |                                       내정보 변경                                       |
| :----------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------: |
| <img src="./public/images/signup-demo.gif" alt="회원가입 시연" width="100%" /> | <img src="./public/images/profile-edit-demo.gif" alt="내정보 변경 시연" width="100%" /> |

## 로그인

- 일반 로그인
- 소셜 로그인 (Google, Kakao, Naver 지원)
- 이메일 통합 계정 기반, 회원가입 시 설정한 닉네임 및 프로필 사용
- 인증 상태 기반 페이지 접근

|                                   일반 로그인                                    |                                       소셜 로그인                                       |
| :------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------: |
| <img src="./public/images/login-demo.gif" alt="일반 로그인 시연" width="100%" /> | <img src="./public/images/social-login-demo.gif" alt="소셜 로그인 시연" width="100%" /> |

## 메인 / 랭킹

- 게시글 목록 조회
- 최신순, 인기순(댓글 수 + 게시글 좋아요 수 기반), 추천순(회원 전용, 태그 + 좋아요 기반) 정렬
- 게시글 검색
- 8개씩 페이지네이션
- 주간, 월간, 누적 목표별 랭킹 조회
- 회원/비회원 접근 분기

|                                         비회원 메인                                          |                                              회원 메인                                              |
| :------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------: |
| <img src="./public/images/guest-main-demo.gif" alt="비회원 메인 페이지 시연" width="100%" /> | <img src="./public/images/main-ranking-demo.gif" alt="회원 메인 페이지와 랭킹 시연" width="100%" /> |

## 게시글 작성 / 상세 / 수정

#### 게시글 작성

- 게시글 작성
- 이미지 최대 3장 첨부 (파일첨부 및 드래그 가능)
- 태그 최대 3개 선택
- 진행 중인 목표 연결
- 투표 생성

#### 게시글 상세

- 이미지 확대 보기
- 좋아요, 공유하기, 북마크
- 댓글 수정, 삭제, 신고

#### 게시글 수정

- 제목, 내용 수정
- 태그 수정
- 연결된 목표 수정
- 투표 수정 불가

|                                      게시글 작성                                       |                                      게시글 상세                                       |                                     게시글 수정                                      |
| :------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------: |
| <img src="./public/images/post-create-demo.gif" alt="게시글 작성 시연" width="100%" /> | <img src="./public/images/post-detail-demo.gif" alt="게시글 상세 시연" width="100%" /> | <img src="./public/images/post-edit-demo.gif" alt="게시글 수정 시연" width="100%" /> |

## 마이페이지

#### 목표 관리

- 목표 생성, 체크, 삭제
- 목표 진행률 반영
- 목표 상태 및 기간 필터

#### 나의 활동

- 완료한 일정: 목표 완료 개수
- 전체 달성률: 전체 목표 대비 완료한 목표의 달성률
- 함께한 기간: 가입일 기준 누적 기간
- 히트맵 조회: 당일 기준으로 체크한 목표가 하위에 표시되며, 호버 시 날짜와 완료 카운트 표시

|                                   목표 관리                                   |                                    나의 활동 / 히트맵                                     |
| :---------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------: |
| <img src="./public/images/goal-demo.gif" alt="목표 관리 시연" width="100%" /> | <img src="./public/images/heatmap-demo.gif" alt="나의 활동과 히트맵 시연" width="100%" /> |

## 내가 쓴 게시글 / 북마크

- 내가 작성한 게시글 목록 조회
- 북마크한 게시글 목록 조회
- 게시글 검색
- 8개씩 페이지네이션
- 게시글 수정 및 삭제
- 성공, 실패 상태는 토스트로 표시

|                                     내가 쓴 게시글                                     |                                        북마크                                         |
| :------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------: |
| <img src="./public/images/my-posts-demo.gif" alt="내가 쓴 게시글 시연" width="100%" /> | <img src="./public/images/bookmark-demo.gif" alt="북마크 게시글 시연" width="100%" /> |

## 토스트

#### 성공

- 목표 생성, 수정, 삭제처럼 요청이 정상 완료되면 성공 토스트를 표시합니다.

#### 실패

- 이미 처리된 요청, 권한 없음, 입력 검증 실패처럼 동작이 막히면 실패 토스트를 표시합니다.

#### 네트워크

- 인터넷 연결이 끊기거나 API 요청이 실패하면 네트워크 토스트를 표시합니다.

|                                           성공                                           |                                           실패                                           |                                           네트워크                                           |
| :--------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------: |
| <img src="./public/images/toast-success-demo.gif" alt="성공 토스트 시연" width="100%" /> | <img src="./public/images/toast-failure-demo.gif" alt="실패 토스트 시연" width="100%" /> | <img src="./public/images/toast-network-demo.gif" alt="네트워크 토스트 시연" width="100%" /> |

## 기술 아키텍처

<p align="center">
  <img src="./public/images/frontend-architecture.png" alt="Frontend Architecture" width="100%" />
</p>

### Frontend

<div>
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=000000" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" />
</div>

### Styling / UI

<div>
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Pretendard-111111?style=for-the-badge&logoColor=white" />
  <img src="https://img.shields.io/badge/lucide-18181B?style=for-the-badge&logo=lucide&logoColor=white" />
  <img src="https://img.shields.io/badge/framer_motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" />
  <img src="https://img.shields.io/badge/sonner-111111?style=for-the-badge&logoColor=white" />
  <img src="https://img.shields.io/badge/swiper-6332F6?style=for-the-badge&logo=swiper&logoColor=white" />
  <img src="https://img.shields.io/badge/recharts-FF6384?style=for-the-badge&logoColor=white" />
  <img src="https://img.shields.io/badge/CVA-111111?style=for-the-badge&logoColor=white" />
  <img src="https://img.shields.io/badge/clsx-111111?style=for-the-badge&logoColor=white" />
  <img src="https://img.shields.io/badge/tailwind_merge-38BDF8?style=for-the-badge&logoColor=white" />
</div>

### State / Data Fetching

<div>
  <img src="https://img.shields.io/badge/Zustand-4B2E2B?style=for-the-badge&logoColor=white" />
  <img src="https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" />
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" />
</div>

### Form / Validation

<div>
  <img src="https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white" />
  <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" />
  <img src="https://img.shields.io/badge/date--fns-770C56?style=for-the-badge&logoColor=white" />
</div>

### Mocking / Test / Docs

<div>
  <img src="https://img.shields.io/badge/MSW-FF6A33?style=for-the-badge&logoColor=white" />
  <img src="https://img.shields.io/badge/Storybook-FF4785?style=for-the-badge&logo=storybook&logoColor=white" />
  <img src="https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" />
  <img src="https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white" />

</div>

### Code Quality / Collaboration / Deploy

<div>
  <img src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" />
  <img src="https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=000000" />
  <img src="https://img.shields.io/badge/Husky-111111?style=for-the-badge&logoColor=white" />
  <img src="https://img.shields.io/badge/lint--staged-111111?style=for-the-badge&logoColor=white" />
  <img src="https://img.shields.io/badge/Commitlint-000000?style=for-the-badge&logo=commitlint&logoColor=white" />
  <img src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white" />
  <img src="https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</div>

## Getting Started

```yaml
- packageManager: pnpm
- react: 19
- storybook: 10.3
```

### 환경 변수 설정

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 아래 값을 추가합니다.

```env
VITE_API_BASE_URL=https://your-api-base-url.com
VITE_ENABLE_MSW=false
```

실제 API 서버 주소로 교체해서 사용합니다. 배포 환경에서 Mock API로 시연하려면 `VITE_ENABLE_MSW=true`로 설정합니다.

### 개발 서버 실행

```bash
pnpm install
pnpm dev
```

### Storybook 실행

```bash
pnpm storybook
```

## 팀

### FE

<div align="center">
<table width="100%" style="width: 100%; table-layout: fixed;" align="center" cellspacing="0" cellpadding="12">
  <colgroup>
    <col width="33.33%" />
    <col width="33.33%" />
    <col width="33.33%" />
  </colgroup>
  <tr>
    <td width="33.33%" align="center" valign="top">
      <a href="https://github.com/alstmd9902"><img src="https://github.com/alstmd9902.png?size=140" width="140" alt="오승연 프로필" /><br /><sub><b>@alstmd9902</b></sub></a>
    </td>
    <td width="33.33%" align="center" valign="top">
      <a href="https://github.com/0rrriiinnn0"><img src="https://github.com/0rrriiinnn0.png?size=140" width="140" alt="김예린 프로필" /><br /><sub><b>@0rrriiinnn0</b></sub></a>
    </td>
    <td width="33.33%" align="center" valign="top">
      <a href="https://github.com/hyunsik2000"><img src="https://github.com/hyunsik2000.png?size=140" width="140" alt="류현식 프로필" /><br /><sub><b>@hyunsik2000</b></sub></a>
    </td>
  </tr>
  <tr>
    <td width="33.33%" align="center">오승연</td>
    <td width="33.33%" align="center">김예린</td>
    <td width="33.33%" align="center">류현식</td>
  </tr>
  <tr>
    <td width="33.33%" align="center">팀장 (Lead)</td>
    <td width="33.33%" align="center">팀원</td>
    <td width="33.33%" align="center">팀원</td>
  </tr>
  <tr>
    <td width="33.33%" align="center">로그인 / 회원가입<br />마이페이지<br />내가 쓴 게시글</td>
    <td width="33.33%" align="center">게시글 상세페이지<br />댓글<br />투표</td>
    <td width="33.33%" align="center">메인페이지<br />게시글 작성/수정<br />북마크</td>
  </tr>
</table>
</div>

## 프로젝트 규칙

> 자세한 내용은 각 문서를 참고해주세요.

| 문서                                            | 설명            |
| ----------------------------------------------- | --------------- |
| [BRANCH.md](./docs/BRANCH.md)                   | 브랜치 전략     |
| [COMMIT.md](./docs/COMMIT.md)                   | 커밋 컨벤션     |
| [CONVENTION.md](./docs/CONVENTION.md)           | 코드 컨벤션     |
| [STRUCTURE.md](./docs/STRUCTURE.md)             | 프로젝트 구조   |
| [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) | 트러블슈팅 기록 |
| [README.md](./docs/README.md)                   | 문서 가이드     |

## Documents

> [요구사항 정의서](https://docs.google.com/spreadsheets/d/19-_7dQ0Yf0QlA2py3M-Yo2n5HnJo3LIc76RSVy_i6qs/edit?gid=0#gid=0)
>
> [API 명세서](https://docs.google.com/spreadsheets/d/1O9q_wttaKF0zb0zollz5SgBZb2u1RdoPsE6xy1lOjBE/edit?gid=669362257#gid=669362257)
>
> [플로우차트](https://www.figma.com/board/FJg467HTAnQSMuLGKaD2lO/Untitled?node-id=0-1&t=BNNaFhAxIFyNlJVy-1)
>
> [화면정의서](https://www.figma.com/design/p5g6QAL8NXyHirhOqxI5MR/Untitled?node-id=53-2&t=KvXxENWaiYRZJHOl-1)
