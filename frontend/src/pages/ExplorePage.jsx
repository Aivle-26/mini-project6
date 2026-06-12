import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getBooks, moveBookToTrash, toggleBookLike } from '../api/booksApi';
import { getAllReviews } from '../api/reviewsApi';
import BookList from '../components/BookList';
import BookCover from '../components/BookCover';
import { MOODS } from '../constants';
import '../styles/ExplorePage.css';

const heroPositions = [
  'hero-book-1', 'hero-book-2', 'hero-book-3', 'hero-book-4', 'hero-book-5',
];

const actionCards = [
  { title: '새로운 책을 찾고 있나요?', description: '랜덤 책 둘러보기', icon: '▧', to: '/random' },
  { title: '뭘 읽을지 모르겠다면?', description: 'AI가 책을 추천해드려요', icon: '✧', to: '/recommend' },
  { title: '다른 서재가 궁금하다면?', description: '공개 서재 둘러보기', icon: '▥', to: '/public-libraries' },
];

function BookCarousel({ books }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 770, behavior: 'smooth' });
  };

  return (
    <div className="book-carousel-wrap">
      <button className="carousel-arrow" onClick={() => scroll(-1)}>&#8249;</button>
      <div className="book-carousel" ref={scrollRef}>
        {books.map((book) => (
          <Link to={`/books/${book.id}`} className="carousel-card" key={book.id}>
            <BookCover book={book} coverClass="explore-cover" size="carousel" />
            <p className="carousel-title">{book.title}</p>
          </Link>
        ))}
      </div>
      <button className="carousel-arrow" onClick={() => scroll(1)}>&#8250;</button>
    </div>
  );
}

function ExplorePage() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';

  const [allBooks, setAllBooks] = useState([]);
  const [ratingMap, setRatingMap] = useState({});
  const [likedBookIds, setLikedBookIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState('');
  const [activeMood, setActiveMood] = useState('');
  const [sortType, setSortType] = useState('latest');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    Promise.all([getBooks(), getAllReviews().catch(() => [])])
      .then(([books, reviews]) => {
        setAllBooks(books);
        const map = {};
        reviews.forEach((r) => {
          if (r.bookId == null || r.rating == null) return;
          if (!map[r.bookId]) map[r.bookId] = { sum: 0, count: 0 };
          map[r.bookId].sum += r.rating;
          map[r.bookId].count += 1;
        });
        const avgMap = {};
        Object.entries(map).forEach(([id, { sum, count }]) => {
          avgMap[id] = { avg: sum / count, count };
        });
        setRatingMap(avgMap);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await moveBookToTrash(id);
      setAllBooks((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleLike = async (id) => {
    const userId = JSON.parse(localStorage.getItem('loginUser') || 'null')?.id;
    if (!userId) return;
    try {
      await toggleBookLike(id, userId);
      const wasLiked = likedBookIds.has(id);
      setLikedBookIds((prev) => {
        const next = new Set(prev);
        wasLiked ? next.delete(id) : next.add(id);
        return next;
      });
      setAllBooks((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, likes: Math.max(0, (b.likes || 0) + (wasLiked ? -1 : 1)) } : b
        )
      );
    } catch (e) {
      console.error('좋아요 실패:', e);
    }
  };

  // 키워드 or 장르 or 분위기 필터 적용
  const filteredBooks = useMemo(() => {
    let result = allBooks;

    if (keyword) {
      const lower = keyword.toLowerCase();
      result = result.filter(
        (b) =>
          (b.title || '').toLowerCase().includes(lower) ||
          (b.author || '').toLowerCase().includes(lower) ||
          (b.genre || '').toLowerCase().includes(lower) ||
          (b.publisher || '').toLowerCase().includes(lower)
      );
    }

    if (activeGenre) {
      result = result.filter((b) => b.genre === activeGenre);
    }

    if (activeMood) {
      result = result.filter((b) => Array.isArray(b.moods) && b.moods.includes(activeMood));
    }

    return [...result]
      .sort((a, b) => {
        let cmp = 0;
        if (sortType === 'latest') cmp = Number(b.id) - Number(a.id);
        if (sortType === 'rating') cmp = (ratingMap[b.id]?.avg || 0) - (ratingMap[a.id]?.avg || 0);
        if (sortType === 'title') cmp = (a.title || '').localeCompare(b.title || '', 'ko');
        if (sortType === 'publishedDate') {
          cmp = (b.publishedDate ? new Date(b.publishedDate).getTime() : 0) -
                (a.publishedDate ? new Date(a.publishedDate).getTime() : 0);
        }
        return sortOrder === 'asc' ? -cmp : cmp;
      })
      .map((b) => ({
        ...b,
        averageRating: ratingMap[b.id] ? Math.round(ratingMap[b.id].avg * 10) / 10 : 0,
        reviewCount: ratingMap[b.id]?.count || 0,
      }));
  }, [allBooks, keyword, activeGenre, activeMood, sortType, sortOrder, ratingMap]);

  // 탐색 섹션용 데이터
  const heroBooks = useMemo(() => {
    const top5 = [...allBooks]
      .sort((a, b) => (ratingMap[b.id]?.avg || 0) - (ratingMap[a.id]?.avg || 0))
      .slice(0, 5);
    for (let i = top5.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [top5[i], top5[j]] = [top5[j], top5[i]];
    }
    return top5;
  }, [allBooks, ratingMap]);
  const trendingBooks = [...allBooks]
    .sort((a, b) => (ratingMap[b.id]?.avg || 0) - (ratingMap[a.id]?.avg || 0))
    .slice(0, 20);
  const recentBooks = [...allBooks]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 20);
  const genres = [...new Set(allBooks.map((b) => b.genre).filter(Boolean))];

  // 키워드 or 장르 or 분위기 필터 적용 시 → 목록 뷰
  const isListMode = !!(keyword || activeGenre || activeMood);

  return (
    <main className="explore-page">
      {/* 히어로 */}
      <section className="explore-hero">
        <div className="hero-floating-books">
          {heroBooks.map((book, i) => (
            <Link
              to={`/books/${book.id}`}
              className={`hero-floating-book ${heroPositions[i]}`}
              key={book.id}
            >
              <BookCover book={book} coverClass="explore-cover" />
            </Link>
          ))}
        </div>

        <div className="explore-hero-copy">
          <h1>Discover</h1>
          <p>다음에 읽고 싶은 책을 발견해보세요</p>
        </div>
      </section>

      {isListMode ? (
        /* ── 검색/장르 필터 목록 뷰 ── */
        <section className="explore-list-section">
          <div className="explore-list-header">
            <h2>
              {keyword
                ? `"${keyword}" 검색 결과`
                : activeMood
                  ? `# ${activeMood}`
                  : `# ${activeGenre}`}
              <span className="explore-list-count">{filteredBooks.length}권</span>
            </h2>

            <div className="explore-sort-controls">
              <select
                className="explore-sort-select"
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
              >
                <option value="latest">등록 최신순</option>
                <option value="rating">별점 높은순</option>
                <option value="title">제목순</option>
                <option value="publishedDate">출판일순</option>
              </select>
              <button
                type="button"
                className="explore-sort-dir-btn"
                onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
              >
                {sortOrder === 'desc' ? '↓' : '↑'}
              </button>
              {activeGenre && (
                <button
                  type="button"
                  className="explore-filter-clear-btn"
                  onClick={() => setActiveGenre('')}
                >
                  ✕ 장르 해제
                </button>
              )}
              {activeMood && (
                <button
                  type="button"
                  className="explore-filter-clear-btn"
                  onClick={() => setActiveMood('')}
                >
                  ✕ 분위기 해제
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <p className="explore-loading">불러오는 중...</p>
          ) : (
            <BookList books={filteredBooks} onDelete={handleDelete} onLike={handleLike} compact />
          )}
        </section>
      ) : (
        /* ── 탐색 뷰 ── */
        <>
          {trendingBooks.length > 0 && (
            <section className="explore-block">
              <h2>이번주 추천 도서</h2>
              <BookCarousel books={trendingBooks} />
            </section>
          )}

          <section className="quick-action-grid">
            {actionCards.map((card) => (
              <Link to={card.to} className="quick-action-card" key={card.title}>
                <div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
                <span>{card.icon}</span>
              </Link>
            ))}
          </section>

          {recentBooks.length > 0 && (
            <section className="explore-block">
              <h2>최근 등록된 책</h2>
              <BookCarousel books={recentBooks} />
            </section>
          )}

          {genres.length > 0 && (
            <section className="explore-block">
              <h2>장르별 둘러보기</h2>
              <div className="tag-list">
                {genres.map((genre) => (
                  <button
                    type="button"
                    className={`explore-tag ${activeGenre === genre ? 'active' : ''}`}
                    key={genre}
                    onClick={() => setActiveGenre(genre)}
                  >
                    {genre}
                    <span>{allBooks.filter((b) => b.genre === genre).length}권</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="explore-block">
            <h2>분위기별 둘러보기</h2>
            <div className="tag-list mood-list">
              {MOODS.map((mood) => {
                const count = allBooks.filter(
                  (b) => Array.isArray(b.moods) && b.moods.includes(mood)
                ).length;
                return (
                  <button
                    type="button"
                    className={`explore-tag mood-tag ${activeMood === mood ? 'active' : ''}`}
                    key={mood}
                    onClick={() => setActiveMood(mood)}
                  >
                    {mood}
                    {count > 0 && <span>{count}권</span>}
                  </button>
                );
              })}
            </div>
          </section>

          {allBooks.length === 0 && !loading && (
            <section className="explore-block">
              <div className="explore-empty">
                <p>아직 등록된 도서가 없습니다.</p>
                <Link to="/add-book">첫 번째 책 등록하기</Link>
              </div>
            </section>
          )}
        </>
      )}

      <footer className="explore-footer">
        <div>
          <h4>서비스</h4>
          <Link to="/">소개</Link>
          <Link to="/">공지사항</Link>
          <Link to="/">이용약관</Link>
          <Link to="/">개인정보처리방침</Link>
        </div>

        <div>
          <h4>커뮤니티</h4>
          <Link to="/">인기 서재</Link>
          <Link to="/">공개 리뷰</Link>
          <Link to="/">추천 책장</Link>
          <Link to="/">독서 피드</Link>
        </div>

        <div>
          <h4>지원</h4>
          <Link to="/">고객센터</Link>
          <Link to="/">이용 가이드</Link>
          <Link to="/">문의하기</Link>
          <Link to="/">피드백 보내기</Link>
        </div>

        <div>
          <h4>앱</h4>
          <Link to="/">iOS 앱 준비중</Link>
          <Link to="/">Android 앱 준비중</Link>
          <Link to="/">업데이트 기록</Link>
        </div>

        <strong>책담*</strong>
      </footer>
    </main>
  );
}

export default ExplorePage;
