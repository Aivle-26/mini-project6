import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getUserBooks } from '../api/usersApi';
import { getAllUsers } from '../api/usersApi';
import '../styles/UserLibraryPage.css';
import { DEFAULT_POSTER, FALLBACK_COLORS, STATUS_LABELS as statusLabels, STATUS_ICONS as statusIcons } from '../constants';

function UserLibraryPage() {
  const { username } = useParams();
  const [targetUser, setTargetUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getAllUsers()
      .then((users) => {
        const found = users.find((u) => u.username === username);
        if (!found) throw new Error('존재하지 않는 사용자입니다.');
        setTargetUser(found);
        return getUserBooks(found.id);
      })
      .then((rawBooks) =>
        setBooks(
          rawBooks
            .filter((b) => b.readingStatus != null && b.readingStatus !== '')
            .map((b) => ({ ...b, status: b.readingStatus }))
        )
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [username]);

  const counts = useMemo(() => ({
    all: books.length,
    want: books.filter((b) => b.status === 'want').length,
    reading: books.filter((b) => b.status === 'reading').length,
    stopped: books.filter((b) => b.status === 'stopped').length,
    finished: books.filter((b) => b.status === 'finished').length,
  }), [books]);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesFilter = activeFilter === 'all' || book.status === activeFilter;
      const lowerKeyword = keyword.trim().toLowerCase();
      const matchesKeyword =
        !lowerKeyword ||
        book.title.toLowerCase().includes(lowerKeyword) ||
        (book.author || '').toLowerCase().includes(lowerKeyword);
      return matchesFilter && matchesKeyword;
    });
  }, [books, activeFilter, keyword]);

  if (loading) {
    return (
      <main className="ulib-page">
        <div className="ulib-inner">
          <p className="ulib-loading">서재를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="ulib-page">
        <div className="ulib-inner">
          <div className="ulib-error">
            <p>{error}</p>
            <Link to="/public-libraries">← 공개 서재 목록으로</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="ulib-page">
      <div className="ulib-inner">
        {/* 헤더 */}
        <div className="ulib-header">
          <Link to="/public-libraries" className="ulib-back">
            ← 공개 서재 목록
          </Link>
          <div className="ulib-header-main">
            <div className="ulib-avatar">
              {targetUser?.profileImage ? (
                <img src={targetUser.profileImage} alt={targetUser.nickname} />
              ) : (
                <span>
                  {(targetUser?.nickname || targetUser?.username || '?')[0].toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="ulib-title">{targetUser?.nickname}의 서재</h1>
              <p className="ulib-subtitle">@{targetUser?.username} · 총 {books.length}권</p>
            </div>
          </div>
        </div>

        <div className="ulib-content">
          {/* 사이드바 — 필터 (읽기 전용) */}
          <aside className="ulib-sidebar">
            {(['all', 'want', 'reading', 'stopped', 'finished']).map((f) => (
              <button
                key={f}
                type="button"
                className={`ulib-filter ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                <span>{statusIcons[f]}</span>
                <strong>{f === 'all' ? '전체 책' : statusLabels[f]}</strong>
                <em>{counts[f]}</em>
              </button>
            ))}
          </aside>

          {/* 본문 */}
          <section className="ulib-main">
            <div className="ulib-toolbar">
              <form className="ulib-search" onSubmit={(e) => e.preventDefault()}>
                <span>⌕</span>
                <input
                  type="text"
                  placeholder="검색..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </form>
              <span className="ulib-readonly-badge">열람 전용</span>
            </div>

            <div className="ulib-book-list">
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <div className="ulib-book-row" key={book.id}>
                    <Link to={`/books/${book.id}`} className="ulib-book-left">
                      {book.poster && book.poster !== DEFAULT_POSTER ? (
                        <img
                          src={book.poster}
                          alt={book.title}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div
                          className={`ulib-fallback-cover ${FALLBACK_COLORS[Number(book.id) % FALLBACK_COLORS.length]}`}
                        >
                          <span>{book.author || ''}</span>
                          <strong>{book.title}</strong>
                        </div>
                      )}
                      <div>
                        <h3>{book.title}</h3>
                        <p>{book.author || '작가 미상'}</p>
                      </div>
                    </Link>

                    {/* 독서 상태 표시 (수정 불가) */}
                    {book.status && (
                      <div className="ulib-status-badge">
                        <span>{statusIcons[book.status]}</span>
                        {statusLabels[book.status]}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="ulib-empty">
                  <p>해당 조건에 맞는 책이 없습니다.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default UserLibraryPage;
