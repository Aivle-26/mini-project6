# 책담 (Chaekdam) API 명세서 (표 요약본)

전체 REST API를 표 형식으로 정리한 요약본입니다.
요청/응답 JSON 예시 등 상세 내용은 [`API.md`](./API.md)를 참고하세요.

## 공통 정보

| 항목 | 내용 |
| --- | --- |
| Base URL | `http://localhost:8080` |
| 데이터 포맷 | `application/json` |
| 인증 방식 | JWT 미사용 — 로그인 후 `userId`를 클라이언트가 보관, 쿼리/본문으로 전달 |
| CORS 허용 Origin | `http://localhost:5173`, `:5174`, `:3000` |
| DB | H2 file (`jdbc:h2:file:./bookapp-data`), 콘솔 `/h2-console` |
| 에러 응답 | `GlobalExceptionHandler` → `{ "message": "..." }` |

## 응답 코드

| 코드 | 의미 |
| --- | --- |
| `200 OK` | 조회/수정/처리 성공 |
| `201 Created` | 리소스 생성 성공 |
| `204 No Content` | 성공(본문 없음) |
| `400 Bad Request` | 검증 실패 / 잘못된 요청 / 중복(이메일·사용자명·닉네임) |
| `404 Not Found` | 리소스 없음 |

---

## 1. 인증 / 사용자 (Auth & User)

| # | 기능 | Method | Endpoint | 요청 파라미터 / 본문 | 응답 | 코드 |
| --- | --- | --- | --- | --- | --- | --- |
| 1.1 | 회원가입 | `POST` | `/auth/signup` | body: email, username(4~20), nickname(≤30), password(≥6) | `AuthResponse` | 201 |
| 1.2 | 로그인 | `POST` | `/auth/login` | body: email, password | `AuthResponse` | 200 |
| 1.3 | 내 정보 조회 | `GET` | `/auth/me` | query: `userId` | `AuthResponse` | 200 |
| 1.4 | 전체 사용자 목록 | `GET` | `/users` | — | `AuthResponse[]` | 200 |
| 1.5 | 공개 서재 사용자 목록 | `GET` | `/users/public` | — | `AuthResponse[]` | 200 |
| 1.6 | 회원 탈퇴 | `DELETE` | `/users/{id}` | path: `id` | — | 204 |
| 1.7 | 서재 공개여부 토글 | `PATCH` | `/users/{id}/library-visibility` | body: `libraryPublic` | `AuthResponse` | 200 |

## 2. 사용자 프로필 (User Profile)

| # | 기능 | Method | Endpoint | 요청 파라미터 / 본문 | 응답 | 코드 |
| --- | --- | --- | --- | --- | --- | --- |
| 2.1 | 프로필 조회 | `GET` | `/users/{username}` | path: `username` | `UserProfileResponse` | 200 |
| 2.2 | 프로필 수정 | `PUT` | `/users/{id}` | body: nickname, username, bio, profileImage | `AuthResponse` | 200 |

## 3. 도서 (Book)

| # | 기능 | Method | Endpoint | 요청 파라미터 / 본문 | 응답 | 코드 |
| --- | --- | --- | --- | --- | --- | --- |
| 3.1 | 전체 조회(휴지통 제외) | `GET` | `/books` | — | `Book[]` | 200 |
| 3.2 | 상세 조회 | `GET` | `/books/{id}` | path: `id` | `Book` | 200 / 404 |
| 3.3 | 도서 등록 | `POST` | `/books` | body: `Book` (title·author 필수) | `Book` | 201 |
| 3.4 | 전체 수정 | `PUT` | `/books/{id}` | body: `Book` | `Book` | 200 |
| 3.5 | 부분 수정 | `PATCH` | `/books/{id}` | body: 변경 필드 | `Book` | 200 |
| 3.6 | 삭제(휴지통 이동) | `DELETE` | `/books/{id}` | path: `id` | — | 204 |
| 3.7 | 휴지통 목록 | `GET` | `/books/trash` | — | `Book[]` | 200 |
| 3.8 | 휴지통 복구 | `PATCH` | `/books/{id}/restore` | path: `id` | — | 204 |
| 3.9 | 영구 삭제 | `DELETE` | `/books/{id}/permanent` | path: `id` | — | 204 |
| 3.10 | 내 서재 목록 | `GET` | `/books/my` | query: `userId` | `Book[]` | 200 |
| 3.11 | 독서 상태 변경 | `PATCH` | `/books/{id}/status` | body: `readingStatus` | `Book` | 200 |
| 3.12 | 책장 배정 | `PATCH` | `/books/{id}/shelf` | body: `bookshelfId`(null 시 제거) | `Book` | 200 |
| 3.13 | AI 표지 저장 | `PATCH` | `/books/{id}/cover` | body: `posterUrl` | `Book` | 200 |
| 3.14 | 타인 서재 도서 | `GET` | `/books/user/{userId}` | path: `userId` | `Book[]` | 200 |
| 3.15 | 맞춤 추천 | `GET` | `/books/recommend` | query: `userId` | `RecommendResponse` | 200 |
| 3.16 | 랜덤 도서 | `GET` | `/books/random` | query: `count`(기본 20) | `Book[]` | 200 |
| 3.17 | 내 서재에 추가 | `POST` | `/books/{id}/my` | query: `userId` | `Book` | 200 |
| 3.18 | 좋아요 토글 | `POST` | `/books/{id}/likes` | query: `userId` | — | 200 |

> `readingStatus` / `action` 값: `want` · `reading` · `stopped` · `finished` (`null`은 해제)
> 독서 상태 변경 시 활동 피드(`feed`)가 자동 생성됩니다.

## 4. 책장 (Bookshelf)

| # | 기능 | Method | Endpoint | 요청 파라미터 / 본문 | 응답 | 코드 |
| --- | --- | --- | --- | --- | --- | --- |
| 4.1 | 책장 생성 | `POST` | `/bookshelves` | body: userId, name | `Bookshelf` | 200 |
| 4.2 | 내 책장 목록 | `GET` | `/bookshelves` | query: `userId` | `Bookshelf[]` | 200 |
| 4.3 | 책장 삭제(소프트) | `DELETE` | `/bookshelves/{id}` | path: `id` | — | 200 |

## 5. 리뷰 (Review)

| # | 기능 | Method | Endpoint | 요청 파라미터 / 본문 | 응답 | 코드 |
| --- | --- | --- | --- | --- | --- | --- |
| 5.1 | 리뷰 목록 조회 | `GET` | `/reviews` | query: `bookId` 또는 `userId` (없으면 전체) | `Review[]` | 200 |
| 5.2 | 리뷰 작성 | `POST` | `/reviews` | body: bookId, userId, writer, content, rating, createdAt | `Review` | 201 |
| 5.3 | 리뷰 수정 | `PATCH` | `/reviews/{id}` | body: 변경 필드 | `Review` | 200 |
| 5.4 | 리뷰 삭제 | `DELETE` | `/reviews/{id}` | path: `id` | — | 204 |

## 6. 하이라이트 (Highlight)

| # | 기능 | Method | Endpoint | 요청 파라미터 / 본문 | 응답 | 코드 |
| --- | --- | --- | --- | --- | --- | --- |
| 6.1 | 도서별 조회 | `GET` | `/highlights` | query: `bookId` | `Highlight[]` | 200 |
| 6.2 | 하이라이트 등록 | `POST` | `/highlights` | body: bookId, userId, quote, note, page, isSpoiler | `Highlight` | 201 |
| 6.3 | 하이라이트 삭제 | `DELETE` | `/highlights/{id}` | path: `id` | — | 204 |

## 7. 팔로우 (Follow)

| # | 기능 | Method | Endpoint | 요청 파라미터 / 본문 | 응답 | 코드 |
| --- | --- | --- | --- | --- | --- | --- |
| 7.1 | 팔로우 토글 | `POST` | `/follow/toggle` | query: `followerId`, `followingId` | `{ following: bool }` | 200 |
| 7.2 | 팔로우 여부 확인 | `GET` | `/follow/check` | query: `followerId`, `followingId` | `{ following: bool }` | 200 |
| 7.3 | 팔로워/팔로잉 수 | `GET` | `/follow/counts/{userId}` | path: `userId` | `{ followerCount, followingCount }` | 200 |
| 7.4 | 팔로잉 사용자 목록 | `GET` | `/follow/following/{followerId}` | path: `followerId` | `AuthResponse[]` | 200 |

## 8. 피드 (Feed)

| # | 기능 | Method | Endpoint | 요청 파라미터 / 본문 | 응답 | 코드 |
| --- | --- | --- | --- | --- | --- | --- |
| 8.1 | 전체 피드 조회 | `GET` | `/feeds` | — | `Feed[]` | 200 |
| 8.2 | 팔로잉 피드 조회 | `GET` | `/feeds/following` | query: `userId` | `FeedResponse[]` | 200 |
| 8.3 | 피드 좋아요 토글 | `POST` | `/feeds/{feedId}/likes` | query: `userId` | — | 200 |
| 8.4 | 피드 댓글 등록 | `POST` | `/feeds/{feedId}/comments` | body: userId, username, content | `FeedComment` | 201 |
| 8.5 | 피드 댓글 조회 | `GET` | `/feeds/{feedId}/comments` | path: `feedId` | `FeedComment[]` | 200 |
| 8.6 | 피드 댓글 삭제 | `DELETE` | `/feeds/comments/{commentId}` | path: `commentId` | — | 204 |

## 9. 검색 (Search)

| # | 기능 | Method | Endpoint | 요청 파라미터 / 본문 | 응답 | 코드 |
| --- | --- | --- | --- | --- | --- | --- |
| 9.1 | 통합 검색 | `GET` | `/search` | query: `keyword` | `{ books: Book[], users: AuthResponse[] }` | 200 |

## 10. AI 표지 생성 (AI Cover)

| # | 기능 | Method | Endpoint | 요청 파라미터 / 본문 | 응답 | 코드 |
| --- | --- | --- | --- | --- | --- | --- |
| 10.1 | AI 표지 생성 | `POST` | `/ai/cover` | body: title, genre, moods, description, coverPrompt, apiKey | `{ posters[] }` (3종) | 200 |

> OpenAI 이미지 API(`gpt-image-2`)로 시네마틱 / 미니멀 상징 / 추상 타이포 3가지 디자인 생성. `apiKey`는 사용자 OpenAI 키.

---

## 부록: 주요 엔티티 필드

| 엔티티 | 필드 |
| --- | --- |
| **Book** | id, title, author, description, isbn, genre, poster, publisher, publishedDate, pageCount, userId, readingStatus, bookshelfId, moods[], representativeCoverId, likes, isFavorite, createdDate, modifiedDate, deletedAt |
| **User** | id, email, password, username, nickname, profileImage, bio, libraryPublic |
| **Bookshelf** | id, userId, name, createdAt, deletedAt |
| **Review** | id, bookId, userId, writer, content, rating, createdAt |
| **Highlight** | id, bookId, userId, quote, note, page, isSpoiler, createdAt |
| **Follow** | id, followerId, followingId, createdDate |
| **Feed** | id, userId, bookId, action, likeCount, commentCount, createdAt |
| **FeedComment** | id, feedId, userId, username, content, createdAt |
| **BookLike** | id, userId, bookId, createdDate |
| **FeedLike** | id, feedId, userId, createdDate |

> 테이블 구조·관계는 [`schema.dbml`](./schema.dbml), 상세 JSON 예시는 [`API.md`](./API.md) 참고.
