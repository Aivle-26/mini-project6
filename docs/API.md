# 책담 (Chaekdam) API 명세서

도서 관리 + 소셜(팔로우/피드) 풀스택 애플리케이션의 REST API 명세입니다.

## 공통 정보

| 항목 | 내용 |
| --- | --- |
| Base URL | `http://localhost:8080` |
| 데이터 포맷 | `application/json` (요청 본문이 있는 경우 `Content-Type: application/json`) |
| 인증 방식 | JWT 미사용. 로그인 후 클라이언트가 `userId`를 localStorage에 저장하고, 필요 시 쿼리 파라미터/본문으로 전달 |
| CORS 허용 Origin | `http://localhost:5173`, `:5174`, `:3000` |
| DB | H2 file 기반 (`jdbc:h2:file:./bookapp-data`), H2 콘솔 `/h2-console` |

### 공통 응답 코드

| 코드 | 의미 |
| --- | --- |
| `200 OK` | 조회/수정/처리 성공 |
| `201 Created` | 리소스 생성 성공 |
| `204 No Content` | 삭제 등 성공(본문 없음) |
| `400 Bad Request` | 검증 실패 / 잘못된 요청 / 중복(이메일·사용자명·닉네임) |
| `404 Not Found` | 리소스 없음 (도서/리뷰/피드 등) |

> 검증 실패·예외 시 `GlobalExceptionHandler`가 `{ "message": "..." }` 형태의 본문을 반환합니다.

---

## 1. 인증 / 사용자 (Auth & User)

### 1.1 회원가입
`POST /auth/signup`

요청 본문
```json
{
  "email": "user@example.com",
  "username": "bookworm",
  "nickname": "책벌레",
  "password": "secret123"
}
```
검증: `email`(이메일 형식), `username`(4~20자), `nickname`(최대 30자), `password`(최소 6자)

응답 `201 Created`
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "bookworm",
  "nickname": "책벌레",
  "profileImage": null,
  "bio": null,
  "libraryPublic": true
}
```

### 1.2 로그인
`POST /auth/login`

요청 본문
```json
{ "email": "user@example.com", "password": "secret123" }
```
응답 `200 OK` — `AuthResponse` (위 1.1과 동일 형태)

### 1.3 내 정보 조회 (세션 검증용)
`GET /auth/me?userId={userId}`

응답 `200 OK` — `AuthResponse`

### 1.4 전체 사용자 목록
`GET /users`

응답 `200 OK` — `AuthResponse[]`

### 1.5 공개 서재 사용자 목록
`GET /users/public`

응답 `200 OK` — `AuthResponse[]` (`libraryPublic = true`인 사용자만)

### 1.6 회원 탈퇴
`DELETE /users/{id}`

응답 `204 No Content`

### 1.7 서재 공개 여부 토글
`PATCH /users/{id}/library-visibility`

요청 본문
```json
{ "libraryPublic": false }
```
응답 `200 OK` — `AuthResponse`

---

## 2. 사용자 프로필 (User Profile)

### 2.1 프로필 조회 (username 기준)
`GET /users/{username}`

응답 `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "bookworm",
  "nickname": "책벌레",
  "bio": "독서를 좋아합니다",
  "profileImage": null,
  "followerCount": 12,
  "followingCount": 8
}
```

### 2.2 프로필 수정
`PUT /users/{id}`

요청 본문 (변경할 필드만 전달 가능)
```json
{
  "nickname": "새 닉네임",
  "username": "newname",
  "bio": "소개글",
  "profileImage": "data:image/png;base64,..."
}
```
응답 `200 OK` — `AuthResponse`

---

## 3. 도서 (Book)

> 모든 경로 prefix: `/books`

### 3.1 전체 도서 조회 (휴지통 제외)
`GET /books` → `200 OK` — `Book[]`

### 3.2 도서 상세 조회
`GET /books/{id}` → `200 OK` — `Book` / 없으면 `404`

### 3.3 도서 등록
`POST /books`

요청 본문 (예시)
```json
{
  "title": "채식주의자",
  "author": "한강",
  "description": "...",
  "genre": "소설",
  "poster": "data:image/png;base64,...",
  "publishedDate": "2007-10-30",
  "moods": ["강렬한", "먹먹한"],
  "likes": 0
}
```
검증: `title`, `author` 필수(`@NotBlank`)
응답 `201 Created` — `Book`

### 3.4 도서 전체 수정
`PUT /books/{id}` — 요청 본문 `Book` 전체 → `200 OK` — `Book`

### 3.5 도서 부분 수정
`PATCH /books/{id}` — 변경할 필드만 담은 객체 → `200 OK` — `Book`

### 3.6 도서 삭제 (휴지통 이동, 소프트 삭제)
`DELETE /books/{id}` → `204 No Content`

### 3.7 휴지통 목록 조회
`GET /books/trash` → `200 OK` — `Book[]` (`deletedAt != null`)

### 3.8 휴지통 복구
`PATCH /books/{id}/restore` → `204 No Content`

### 3.9 영구 삭제
`DELETE /books/{id}/permanent` → `204 No Content`

### 3.10 내 서재 도서 목록
`GET /books/my?userId={userId}` → `200 OK` — `Book[]`

### 3.11 독서 상태 변경
`PATCH /books/{id}/status`
```json
{ "readingStatus": "reading" }
```
값: `want` | `reading` | `stopped` | `finished` | `null`(해제)
응답 `200 OK` — `Book`
> 상태 변경 시 활동 피드(`feed`)가 함께 생성됩니다.

### 3.12 책장 배정
`PATCH /books/{id}/shelf`
```json
{ "bookshelfId": 3 }
```
`bookshelfId: null` 전달 시 책장에서 제거. 응답 `200 OK` — `Book`

### 3.13 AI 표지 저장
`PATCH /books/{id}/cover`
```json
{ "posterUrl": "data:image/png;base64,..." }
```
응답 `200 OK` — `Book`

### 3.14 타인 서재 도서 조회
`GET /books/user/{userId}` → `200 OK` — `Book[]`

### 3.15 맞춤 추천
`GET /books/recommend?userId={userId}`

응답 `200 OK`
```json
{
  "topGenres": ["소설", "에세이"],
  "topMoods": ["강렬한", "따뜻한"],
  "books": [
    { "book": { "id": 5, "title": "..." }, "score": 8, "matchReason": "장르·분위기 일치" }
  ],
  "totalLibraryCount": 12
}
```

### 3.16 랜덤 도서 조회
`GET /books/random?count={count}` (기본 20) → `200 OK` — `Book[]`

### 3.17 내 서재에 추가
`POST /books/{id}/my?userId={userId}` → `200 OK` — `Book`

### 3.18 도서 좋아요 토글
`POST /books/{id}/likes?userId={userId}` → `200 OK` (본문 없음)

---

## 4. 책장 (Bookshelf)

> prefix: `/bookshelves`

### 4.1 책장 생성
`POST /bookshelves`
```json
{ "userId": 1, "name": "올해의 책" }
```
응답 `200 OK` — `Bookshelf`

### 4.2 내 책장 목록
`GET /bookshelves?userId={userId}` → `200 OK` — `Bookshelf[]`

### 4.3 책장 삭제 (소프트)
`DELETE /bookshelves/{id}` → `200 OK`

---

## 5. 리뷰 (Review)

> prefix: `/reviews`

### 5.1 리뷰 목록 조회
`GET /reviews` — 쿼리로 필터링
- `?bookId={bookId}` : 특정 도서의 리뷰
- `?userId={userId}` : 특정 사용자의 리뷰
- 파라미터 없음 : 전체 리뷰

응답 `200 OK` — `Review[]`
```json
[
  { "id": 1, "bookId": 5, "userId": 1, "writer": "책벌레", "content": "좋았어요", "rating": 5, "createdAt": "2026-06-12" }
]
```

### 5.2 리뷰 작성
`POST /reviews`
```json
{ "bookId": 5, "userId": 1, "writer": "책벌레", "content": "...", "rating": 4, "createdAt": "2026-06-12" }
```
응답 `201 Created` — `Review`

### 5.3 리뷰 수정
`PATCH /reviews/{id}` — 변경 필드 → `200 OK` — `Review`

### 5.4 리뷰 삭제
`DELETE /reviews/{id}` → `204 No Content`

---

## 6. 하이라이트 (Highlight)

> prefix: `/highlights`

### 6.1 도서별 하이라이트 조회
`GET /highlights?bookId={bookId}` → `200 OK` — `Highlight[]`

### 6.2 하이라이트 등록
`POST /highlights`
```json
{
  "bookId": 5,
  "userId": 1,
  "quote": "기억하고 싶은 문장",
  "note": "메모",
  "page": "123",
  "isSpoiler": false
}
```
응답 `201 Created` — `Highlight`

### 6.3 하이라이트 삭제
`DELETE /highlights/{id}` → `204 No Content`

---

## 7. 팔로우 (Follow)

> prefix: `/follow`

### 7.1 팔로우 토글
`POST /follow/toggle?followerId={a}&followingId={b}`

응답 `200 OK`
```json
{ "following": true }
```

### 7.2 팔로우 여부 확인
`GET /follow/check?followerId={a}&followingId={b}` → `200 OK` — `{ "following": false }`

### 7.3 팔로워/팔로잉 수
`GET /follow/counts/{userId}` → `200 OK`
```json
{ "followerCount": 12, "followingCount": 8 }
```

### 7.4 팔로잉 사용자 목록
`GET /follow/following/{followerId}` → `200 OK` — `AuthResponse[]`

---

## 8. 피드 (Feed)

> prefix: `/feeds`

### 8.1 전체 피드 조회
`GET /feeds` → `200 OK` — `Feed[]`

### 8.2 팔로잉 피드 조회 (홈 화면)
`GET /feeds/following?userId={userId}`

응답 `200 OK`
```json
[
  {
    "id": 10,
    "action": "finished",
    "createdAt": "2026-06-12T10:00:00",
    "likeCount": 3,
    "commentCount": 1,
    "user": { "id": 2, "username": "reader", "nickname": "독서가", "profileImage": null },
    "book": { "id": 5, "title": "채식주의자", "author": "한강", "poster": "..." }
  }
]
```

### 8.3 피드 좋아요 토글
`POST /feeds/{feedId}/likes?userId={userId}` → `200 OK` (본문 없음)

### 8.4 피드 댓글 등록
`POST /feeds/{feedId}/comments`
```json
{ "userId": 1, "username": "책벌레", "content": "공감해요" }
```
응답 `201 Created` — `FeedComment`

### 8.5 피드 댓글 조회
`GET /feeds/{feedId}/comments` → `200 OK` — `FeedComment[]`

### 8.6 피드 댓글 삭제
`DELETE /feeds/comments/{commentId}` → `204 No Content`

---

## 9. 검색 (Search)

### 9.1 통합 검색
`GET /search?keyword={keyword}`

응답 `200 OK` — 도서(`Book[]`) + 사용자(`AuthResponse[]`, 비밀번호 제외) 동시 검색
```json
{
  "books": [ { "id": 5, "title": "채식주의자", "author": "한강" } ],
  "users": [ { "id": 2, "username": "reader", "nickname": "독서가", "profileImage": null, "bio": null, "libraryPublic": true } ]
}
```

---

## 10. AI 표지 생성 (AI Cover)

### 10.1 표지 생성
`POST /ai/cover`

요청 본문
```json
{
  "title": "채식주의자",
  "genre": "소설",
  "moods": ["강렬한", "먹먹한"],
  "description": "도서 설명",
  "coverPrompt": "어두운 분위기",
  "apiKey": "sk-..."
}
```
- 서버가 OpenAI 이미지 생성 API(`gpt-image-2`)를 호출하여 **3가지 디자인 방식**(시네마틱 / 미니멀 상징 / 추상 타이포)의 표지를 생성
- `apiKey`는 사용자의 OpenAI API 키(클라이언트가 직접 입력)

응답 `200 OK`
```json
{ "posters": ["data:image/png;base64,...", "data:image/png;base64,...", "data:image/png;base64,..."] }
```

---

## 부록: 주요 엔티티 필드 요약

### Book
`id, title, author, description, isbn, genre, poster, publisher, publishedDate, pageCount, userId, readingStatus, bookshelfId, moods[], representativeCoverId, likes, isFavorite, createdDate, modifiedDate, deletedAt`

### User
`id, email, password, username, nickname, profileImage, bio, libraryPublic`

### Review
`id, bookId, userId, writer, content, rating, createdAt`

### Highlight
`id, bookId, userId, quote, note, page, isSpoiler, createdAt`

### Feed
`id, userId, bookId, action, likeCount, commentCount, createdAt`

> 자세한 테이블 구조와 관계는 [`schema.dbml`](./schema.dbml) (dbdiagram.io) 참고.
