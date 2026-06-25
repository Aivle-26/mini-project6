import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBooks } from '../api/booksApi';
import { DEFAULT_POSTER } from '../constants';
import '../styles/LandingPage.css';

const heroSlides = [
  {
    id: 'ai-library',
    badge: 'AI 추천 도서',
    title: 'AI와 함께하는\n우리들의 서재',
    copy: 'AI가 당신의 취향과 독서 기록을 분석해 새로운 책을 추천해 드립니다.',
    tabletTitle: '사색의 시간',
    tabletCopy: '깊은 사색이 흔들릴 때 당신의 하루를 바꿉니다.',
  },
  {
    id: 'record',
    badge: '독서 기록',
    title: '읽는 순간을\n차곡차곡 기록',
    copy: '책장, 리뷰, 하이라이트를 한곳에 모아 나만의 독서 흐름을 만들 수 있습니다.',
    tabletTitle: '문장 수집가',
    tabletCopy: '오늘의 문장을 저장하고 다시 꺼내 읽어보세요.',
  },
  {
    id: 'social',
    badge: '함께 읽기',
    title: '서재를 나누고\n취향을 발견',
    copy: '다른 사람의 서재와 리뷰를 둘러보며 다음 책을 더 쉽게 고를 수 있습니다.',
    tabletTitle: '공유 서재',
    tabletCopy: '좋아하는 책을 따라 새로운 독자를 만납니다.',
  },
  {
    id: 'goal',
    badge: '독서 목표',
    title: '오늘의 한 권이\n습관이 되도록',
    copy: '이번 주 목표와 진행률을 확인하며 꾸준한 독서 루틴을 이어가세요.',
    tabletTitle: '읽는 중',
    tabletCopy: '작은 목표가 긴 독서의 리듬이 됩니다.',
  },
];

const fallbackRecommendations = [
  {
    id: 'sample-1',
    title: '아주 천천히 빛나는',
    author: '정세랑 에세이',
    description: '조금 느려도 괜찮아, 나답게 빛나는 시간을 위한 기록',
    price: '15,800원',
    poster: DEFAULT_POSTER,
    badge: '베스트\n에세이',
  },
  {
    id: 'sample-2',
    title: '사색의 시간',
    author: '김영인 지음',
    description: '깊은 사색이 흔들릴 때 당신의 하루를 바꿉니다.',
    price: '16,200원',
    poster: DEFAULT_POSTER,
    badge: 'AI 추천',
  },
  {
    id: 'sample-3',
    title: '초록의 문장들',
    author: '책담 큐레이션',
    description: '조용한 오후에 어울리는 단정한 문장 모음',
    price: '14,900원',
    poster: DEFAULT_POSTER,
    badge: '오늘의 책',
  },
  {
    id: 'sample-4',
    title: '나의 작은 서재',
    author: '독서 노트',
    description: '취향을 발견하고 기록하는 사람들을 위한 안내서',
    price: '13,500원',
    poster: DEFAULT_POSTER,
    badge: '추천',
  },
];

function normalizeRecommendation(book, index) {
  return {
    id: book.id,
    title: book.title || fallbackRecommendations[index].title,
    author: book.author || fallbackRecommendations[index].author,
    description: book.description || fallbackRecommendations[index].description,
    price: book.price ? `${book.price.toLocaleString()}원` : fallbackRecommendations[index].price,
    poster: book.poster || DEFAULT_POSTER,
    badge: fallbackRecommendations[index].badge,
  };
}

function LandingPage() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [recommendIndex, setRecommendIndex] = useState(0);
  const [recommendations, setRecommendations] = useState(fallbackRecommendations);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const books = await getBooks();
        const visibleBooks = books
          .slice(0, 4)
          .map((book, index) => normalizeRecommendation(book, index));

        if (visibleBooks.length > 0) {
          setRecommendations([
            ...visibleBooks,
            ...fallbackRecommendations.slice(visibleBooks.length),
          ].slice(0, 4));
        }
      } catch (err) {
        console.error('랜딩 페이지 도서 불러오기 실패:', err);
      }
    };

    loadBooks();
  }, []);

  const hero = heroSlides[heroIndex];
  const recommendedBook = recommendations[recommendIndex];
  const bookLink = String(recommendedBook.id).startsWith('sample')
    ? '/explore'
    : `/books/${recommendedBook.id}`;

  const recommendationDots = useMemo(
    () => recommendations.map((book) => book.id),
    [recommendations],
  );

  return (
    <main className="landing-page">
      <section className="landing-showcase" aria-label="책담 홈">
        <article className="landing-hero-card">
          <div className="landing-hero-copy">
            <span className="landing-badge">{hero.badge}</span>
            <span className="landing-spark">✦</span>
            <h1>{hero.title}</h1>
            <p>{hero.copy}</p>
            <Link to="/explore" className="landing-primary-btn">
              AI 책담 추천 받기 <span>→</span>
            </Link>
          </div>

          <div className="landing-still-life" aria-hidden="true">
            <div className="landing-book-spine landing-book-spine-left">
              <span>A Room</span>
              <span>of One&apos;s Own</span>
            </div>
            <div className="landing-cup" />
            <div className="landing-tablet">
              <strong>책담<span>*</span></strong>
              <em>오늘의 추천 책</em>
              <h2>{hero.tabletTitle}</h2>
              <p>{hero.tabletCopy}</p>
              <button type="button">자세히 보기</button>
              <i />
            </div>
            <div className="landing-book-stack">
              <span>The Book of Delights</span>
              <span>The Artist&apos;s Way</span>
            </div>
            <div className="landing-vase">
              <span className="stem stem-1" />
              <span className="stem stem-2" />
              <span className="stem stem-3" />
              <span className="leaf leaf-1" />
              <span className="leaf leaf-2" />
              <span className="leaf leaf-3" />
              <span className="leaf leaf-4" />
              <span className="leaf leaf-5" />
            </div>
          </div>

          <div className="landing-hero-controls" aria-label="대표 영역 슬라이드">
            <div className="landing-dots">
              {heroSlides.map((slide, index) => (
                <button
                  type="button"
                  key={slide.id}
                  className={index === heroIndex ? 'active' : ''}
                  onClick={() => setHeroIndex(index)}
                  aria-label={`${index + 1}번 히어로 보기`}
                />
              ))}
            </div>

            <div className="landing-arrow-controls">
              <button type="button" aria-label="히어로 이전" onClick={() => setHeroIndex((heroIndex + heroSlides.length - 1) % heroSlides.length)}>
                ‹
              </button>
              <span>{heroIndex + 1} / {heroSlides.length}</span>
              <button type="button" aria-label="히어로 다음" onClick={() => setHeroIndex((heroIndex + 1) % heroSlides.length)}>
                ›
              </button>
            </div>
          </div>
        </article>

        <aside className="landing-recommend-card" aria-label="추천 도서">
          <div className="landing-recommend-head">
            <h2>추천 도서</h2>
            <Link to="/explore">더보기 <span>→</span></Link>
          </div>

          <div className="landing-recommend-visual">
            <Link to={bookLink} className="landing-recommend-cover">
              {recommendedBook.poster && recommendedBook.poster !== DEFAULT_POSTER ? (
                <img
                  src={recommendedBook.poster}
                  alt={recommendedBook.title}
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_POSTER;
                  }}
                />
              ) : (
                <div className="landing-cover-fallback">
                  <span>{recommendedBook.author}</span>
                  <strong>{recommendedBook.title}</strong>
                </div>
              )}
            </Link>

            <span className="landing-book-badge">{recommendedBook.badge}</span>

            <button
              type="button"
              className="landing-image-arrow landing-image-arrow-left"
              aria-label="추천 도서 이전"
              onClick={() => setRecommendIndex((recommendIndex + recommendations.length - 1) % recommendations.length)}
            >
              ‹
            </button>
            <button
              type="button"
              className="landing-image-arrow landing-image-arrow-right"
              aria-label="추천 도서 다음"
              onClick={() => setRecommendIndex((recommendIndex + 1) % recommendations.length)}
            >
              ›
            </button>
          </div>

          <div className="landing-recommend-info">
            <h3>{recommendedBook.title}</h3>
            <p className="landing-book-author">{recommendedBook.author}</p>
            <p className="landing-book-desc">{recommendedBook.description}</p>
            <strong>{recommendedBook.price}</strong>
          </div>

          <div className="landing-recommend-dots" aria-label="추천 도서 슬라이드">
            {recommendationDots.map((id, index) => (
              <button
                type="button"
                key={id}
                className={index === recommendIndex ? 'active' : ''}
                onClick={() => setRecommendIndex(index)}
                aria-label={`${index + 1}번 추천 도서 보기`}
              />
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

export default LandingPage;
