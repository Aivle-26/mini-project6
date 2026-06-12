import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRecommendedBooks } from '../api/booksApi';
import BookCover from '../components/BookCover';
import '../styles/RecommendPage.css';

function RecommendPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    getRecommendedBooks(user.id)
      .then(setData)
      .catch(() => setError('추천 도서를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <main className="rec-page">
        <div className="rec-inner">
          <div className="rec-gate">
            <p>로그인 후 이용할 수 있습니다.</p>
            <Link to="/login">로그인하기 →</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="rec-page">
      <div className="rec-inner">
        {/* 헤더 */}
        <div className="rec-header">
          <p className="rec-label">맞춤 책 추천</p>
          <h1 className="rec-title">취향에 맞는 책을 골라드렸어요</h1>
          <p className="rec-desc">
            내 서재의 장르와 분위기 태그를 분석해 비슷한 책을 추천합니다.
          </p>
        </div>

        {loading && <p className="rec-loading">취향을 분석하는 중...</p>}

        {error && <p className="rec-error">{error}</p>}

        {data && !loading && (
          <>
            {/* 취향 분석 섹션 */}
            <section className="rec-analysis">
              <h2 className="rec-section-title">
                내 독서 취향 분석
                <span className="rec-count">서재 {data.totalLibraryCount}권 기반</span>
              </h2>

              {data.totalLibraryCount < 3 ? (
                <div className="rec-thin-library">
                  <p>서재에 책이 부족해 정확한 분석이 어렵습니다.</p>
                  <Link to="/add-book">책을 더 추가하면 정확해져요 →</Link>
                </div>
              ) : (
                <div className="rec-analysis-body">
                  {data.topGenres.length > 0 && (
                    <div className="rec-tag-group">
                      <span className="rec-tag-label">선호 장르</span>
                      <div className="rec-tags">
                        {data.topGenres.map((g) => (
                          <span className="rec-tag rec-tag-genre" key={g}>{g}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.topMoods.length > 0 && (
                    <div className="rec-tag-group">
                      <span className="rec-tag-label">선호 분위기</span>
                      <div className="rec-tags">
                        {data.topMoods.map((m) => (
                          <span className="rec-tag rec-tag-mood" key={m}>{m}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.topGenres.length === 0 && data.topMoods.length === 0 && (
                    <p className="rec-no-tags">서재 도서에 장르·분위기 태그가 없습니다.</p>
                  )}
                </div>
              )}
            </section>

            {/* 추천 도서 */}
            <section className="rec-books-section">
              <h2 className="rec-section-title">추천 도서</h2>

              {data.books.length === 0 ? (
                <div className="rec-empty">
                  {data.totalLibraryCount < 3 ? (
                    <p>서재에 책을 3권 이상 추가하면 추천이 시작됩니다.</p>
                  ) : (
                    <p>취향에 맞는 새로운 책이 없습니다. 더 많은 책이 등록되면 추천해드릴게요.</p>
                  )}
                  <Link to="/explore">둘러보기로 이동 →</Link>
                </div>
              ) : (
                <div className="rec-grid">
                  {data.books.map(({ book, matchReason }) => (
                    <Link to={`/books/${book.id}`} className="rec-card" key={book.id}>
                      <BookCover book={book} coverClass="rec-cover" />
                      <div className="rec-card-info">
                        <h3 className="rec-card-title">{book.title}</h3>
                        {book.author && (
                          <p className="rec-card-author">{book.author}</p>
                        )}
                        <p className="rec-card-reason">{matchReason}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default RecommendPage;
