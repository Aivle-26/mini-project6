import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBooks } from '../api/booksApi';
import '../styles/LandingPage.css';
import { DEFAULT_POSTER } from '../constants';

const fallbackBooks = [
  {
    id: 'sample-1',
    title: '기본 표지',
    author: '책담',
    poster: DEFAULT_POSTER,
    sizeClass: 'book-small',
  },
  {
    id: 'sample-2',
    title: '기본 표지',
    author: '책담',
    poster: DEFAULT_POSTER,
    sizeClass: 'book-large',
  },
  {
    id: 'sample-3',
    title: '기본 표지',
    author: '책담',
    poster: DEFAULT_POSTER,
    sizeClass: 'book-normal',
  },
  {
    id: 'sample-4',
    title: '기본 표지',
    author: '책담',
    poster: DEFAULT_POSTER,
    sizeClass: 'book-small',
  },
  {
    id: 'sample-5',
    title: '기본 표지',
    author: '책담',
    poster: DEFAULT_POSTER,
    sizeClass: 'book-large',
  },
  {
    id: 'sample-6',
    title: '기본 표지',
    author: '책담',
    poster: DEFAULT_POSTER,
    sizeClass: 'book-normal',
  },
  {
    id: 'sample-7',
    title: '기본 표지',
    author: '책담',
    poster: DEFAULT_POSTER,
    sizeClass: 'book-large',
  },
  {
    id: 'sample-8',
    title: '기본 표지',
    author: '책담',
    poster: DEFAULT_POSTER,
    sizeClass: 'book-small',
  },
];

const sizeClasses = [
  'book-small',
  'book-large',
  'book-normal',
  'book-small',
  'book-large',
  'book-normal',
  'book-large',
  'book-small',
  'book-normal',
  'book-small',
  'book-large',
  'book-small',
  'book-normal',
  'book-small',
  'book-normal',
  'book-small',
];

function LandingPage() {
  const [displayBooks, setDisplayBooks] = useState(fallbackBooks);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const books = await getBooks();

        const visibleBooks = books
          .slice(0, 16)
          .map((book, index) => ({
            ...book,
            poster: book.poster || DEFAULT_POSTER,
            sizeClass: sizeClasses[index % sizeClasses.length],
          }));

        if (visibleBooks.length > 0) {
          setDisplayBooks(visibleBooks);
        }
      } catch (err) {
        console.error('랜딩 페이지 도서 불러오기 실패:', err);
      }
    };

    loadBooks();
  }, []);

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-copy">
          <h1>
            Ai와 함께하는
            <br />
            우리들의 서재
          </h1>

          <p>
            읽고 있는 책을 기록하고, 친구를 팔로우하며, 다양한 서재와 리뷰를 통해
            새로운 책을 발견할 수 있습니다.
          </p>

          <div className="landing-actions">
            <Link to="/join" className="landing-primary-btn">
              무료로 시작하기 →
            </Link>

            <Link to="/explore" className="landing-secondary-btn">
              책 둘러보기
            </Link>
          </div>
        </div>

        <div className="landing-book-stage">
          {displayBooks.map((book, index) => (
            <Link
              to={
                book.id?.toString().startsWith('sample')
                  ? '/explore'
                  : `/books/${book.id}`
              }
              className={`landing-book landing-book-${index + 1} ${book.sizeClass}`}
              key={book.id}
              title={book.title}
            >
              <img
                src={book.poster || DEFAULT_POSTER}
                alt={book.title || '책 표지'}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_POSTER;
                }}
              />
            </Link>
          ))}
        </div>

        <p className="landing-hint">
          ↖ 마음에 드는 책을 클릭해서 둘러보세요
        </p>
      </section>

      <section className="landing-features">
        <div className="landing-section-title">
          <h2>
            독서 진행 상황을 기록하고
            <br />
            나만의 서재를 온라인으로 관리하세요
          </h2>
        </div>

        <div className="landing-feature-grid">
          <article className="landing-feature-card">
            <h3>개인 독서 목표</h3>
            <p>
              올해 읽고 싶은 책 수를 정하고, 나만의 독서 목표를 기록할 수 있습니다.
            </p>
          </article>

          <article className="landing-feature-card wide">
            <h3>읽고 있는 책과 서재 관리</h3>
            <ul>
              <li>내 서재를 책장처럼 정리</li>
              <li>읽는 중 / 완독 / 읽고 싶은 책 관리</li>
              <li>리뷰와 독서 기록 저장</li>
              <li>AI 표지로 나만의 책 분위기 표현</li>
            </ul>
          </article>

          <article className="landing-feature-card">
            <h3>소셜 독서 피드</h3>
            <p>
              팔로우한 사용자의 리뷰와 독서 활동을 보며 새로운 책을 발견할 수 있습니다.
            </p>
          </article>

          <article className="landing-feature-card">
            <h3>인상 깊은 문장과 노트</h3>
            <p>
              책을 읽으며 기억하고 싶은 문장과 감상을 기록할 수 있습니다.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;