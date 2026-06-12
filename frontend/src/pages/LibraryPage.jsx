import { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyBooks, updateReadingStatus } from '../api/booksApi';
import { getMyBookshelves, createBookshelf, deleteBookshelf } from '../api/bookshelfApi';
import { updateLibraryVisibility } from '../api/usersApi';
import '../styles/LibraryPage.css';
import { DEFAULT_POSTER, FALLBACK_COLORS, STATUS_LABELS as statusLabels, STATUS_ICONS as statusIcons } from '../constants';

function LibraryPage() {
  const { user, login } = useAuth();
  const [books, setBooks] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeShelfId, setActiveShelfId] = useState(null);
  const [libraryPublic, setLibraryPublic] = useState(
    user?.libraryPublic !== false
  );
  const [visibilityLoading, setVisibilityLoading] = useState(false);

  const [bookshelves, setBookshelves] = useState([]);
  const [creatingShelf, setCreatingShelf] = useState(false);
  const [newShelfName, setNewShelfName] = useState('');
  const shelfInputRef = useRef(null);

  const [keyword, setKeyword] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    if (!user) return;
    getMyBooks(user.id)
      .then((rawBooks) =>
        setBooks(
          rawBooks
            .filter((b) => b.readingStatus || b.bookshelfId)
            .map((b) => ({ ...b, status: b.readingStatus || null }))
        )
      )
      .catch(console.error);
    getMyBookshelves(user.id)
      .then(setBookshelves)
      .catch(console.error);
  }, [user]);

  useEffect(() => {
    if (creatingShelf && shelfInputRef.current) {
      shelfInputRef.current.focus();
    }
  }, [creatingShelf]);

  const counts = useMemo(() => {
    return {
      all: books.length,
      want: books.filter((book) => book.status === 'want').length,
      reading: books.filter((book) => book.status === 'reading').length,
      stopped: books.filter((book) => book.status === 'stopped').length,
      finished: books.filter((book) => book.status === 'finished').length,
    };
  }, [books]);

  const shelfCounts = useMemo(() => {
    const map = {};
    bookshelves.forEach((shelf) => {
      map[shelf.id] = books.filter((b) => b.bookshelfId === shelf.id).length;
    });
    return map;
  }, [books, bookshelves]);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesFilter =
        activeFilter === 'all' || book.status === activeFilter;

      const matchesShelf =
        activeShelfId === null || book.bookshelfId === activeShelfId;

      const lowerKeyword = keyword.trim().toLowerCase();
      const matchesKeyword =
        !lowerKeyword ||
        book.title.toLowerCase().includes(lowerKeyword) ||
        (book.author || '').toLowerCase().includes(lowerKeyword);

      return matchesFilter && matchesShelf && matchesKeyword;
    });
  }, [books, activeFilter, activeShelfId, keyword]);

  const handleStatusChange = async (bookId, nextStatus) => {
    const target = books.find((b) => b.id === bookId);
    const isSame = target?.status === nextStatus;
    const finalStatus = isSame ? null : nextStatus;
    try {
      await updateReadingStatus(bookId, finalStatus);
    } catch (e) {
      console.error('상태 변경 실패:', e);
    }
    setBooks((prevBooks) =>
      prevBooks.map((book) =>
        book.id === bookId ? { ...book, status: finalStatus } : book
      )
    );
    setOpenMenuId(null);
  };

  const handleCreateShelf = async () => {
    const trimmed = newShelfName.trim();
    if (!trimmed) {
      setCreatingShelf(false);
      setNewShelfName('');
      return;
    }
    try {
      const created = await createBookshelf(user.id, trimmed);
      setBookshelves((prev) => [...prev, created]);
    } catch (e) {
      console.error('책장 생성 실패:', e);
      alert('책장 생성에 실패했습니다.');
    }
    setCreatingShelf(false);
    setNewShelfName('');
  };

  const handleDeleteShelf = async (shelfId) => {
    if (!window.confirm('이 책장을 삭제할까요?')) return;
    try {
      await deleteBookshelf(shelfId);
      setBookshelves((prev) => prev.filter((s) => s.id !== shelfId));
      if (activeShelfId === shelfId) setActiveShelfId(null);
    } catch (e) {
      console.error('책장 삭제 실패:', e);
    }
  };

  const handleSelectShelf = (shelfId) => {
    setActiveShelfId((prev) => (prev === shelfId ? null : shelfId));
    setActiveFilter('all');
  };

  const handleSelectStatus = (filter) => {
    setActiveFilter(filter);
    setActiveShelfId(null);
  };

  const handleVisibilityToggle = async () => {
    if (!user || visibilityLoading) return;
    const next = !libraryPublic;
    setVisibilityLoading(true);
    try {
      const updated = await updateLibraryVisibility(user.id, next);
      setLibraryPublic(updated.libraryPublic);
      login(updated); // localStorage 유저 정보 갱신
    } catch {
      alert('설정 변경에 실패했습니다.');
    } finally {
      setVisibilityLoading(false);
    }
  };

  return (
    <main className="library-page">
      <div className="library-inner">
        <nav className="library-top-tabs">
          <button type="button" className="active">
            책
          </button>
          <button type="button">리뷰</button>
          <button type="button">하이라이트</button>
        </nav>

        <div className="library-content">
          <aside className="library-sidebar">
            <button
              type="button"
              className={`library-filter ${activeFilter === 'all' && activeShelfId === null ? 'active' : ''}`}
              onClick={() => handleSelectStatus('all')}
            >
              <span>{statusIcons.all}</span>
              <strong>{statusLabels.all}</strong>
              <em>{counts.all}</em>
            </button>

            <button
              type="button"
              className={`library-filter ${activeFilter === 'want' ? 'active' : ''}`}
              onClick={() => handleSelectStatus('want')}
            >
              <span>{statusIcons.want}</span>
              <strong>{statusLabels.want}</strong>
              <em>{counts.want}</em>
            </button>

            <button
              type="button"
              className={`library-filter ${activeFilter === 'reading' ? 'active' : ''}`}
              onClick={() => handleSelectStatus('reading')}
            >
              <span>{statusIcons.reading}</span>
              <strong>{statusLabels.reading}</strong>
              <em>{counts.reading}</em>
            </button>

            <button
              type="button"
              className={`library-filter ${activeFilter === 'stopped' ? 'active' : ''}`}
              onClick={() => handleSelectStatus('stopped')}
            >
              <span>{statusIcons.stopped}</span>
              <strong>{statusLabels.stopped}</strong>
              <em>{counts.stopped}</em>
            </button>

            <button
              type="button"
              className={`library-filter ${activeFilter === 'finished' ? 'active' : ''}`}
              onClick={() => handleSelectStatus('finished')}
            >
              <span>{statusIcons.finished}</span>
              <strong>{statusLabels.finished}</strong>
              <em>{counts.finished}</em>
            </button>

            <div className="library-sidebar-line" />

            {bookshelves.map((shelf) => (
              <div
                key={shelf.id}
                className={`library-shelf-item ${activeShelfId === shelf.id ? 'active' : ''}`}
              >
                <button
                  type="button"
                  className="library-shelf-btn"
                  onClick={() => handleSelectShelf(shelf.id)}
                >
                  <span>▤</span>
                  <strong>{shelf.name}</strong>
                  <em>{shelfCounts[shelf.id] || 0}</em>
                </button>
                <button
                  type="button"
                  className="library-shelf-delete"
                  onClick={() => handleDeleteShelf(shelf.id)}
                  title="책장 삭제"
                >
                  ×
                </button>
              </div>
            ))}

            {creatingShelf ? (
              <div className="create-shelf-input-row">
                <input
                  ref={shelfInputRef}
                  type="text"
                  value={newShelfName}
                  onChange={(e) => setNewShelfName(e.target.value)}
                  placeholder="책장 이름 입력"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateShelf();
                    if (e.key === 'Escape') {
                      setCreatingShelf(false);
                      setNewShelfName('');
                    }
                  }}
                  onBlur={handleCreateShelf}
                />
              </div>
            ) : (
              <button
                type="button"
                className="create-shelf-btn"
                onClick={() => setCreatingShelf(true)}
              >
                <span>＋</span>
                책장 만들기
              </button>
            )}
          </aside>

          <section className="library-main">
            <div className="library-toolbar">
              <form className="library-search" onSubmit={(e) => e.preventDefault()}>
                <span>⌕</span>
                <input
                  type="text"
                  placeholder="검색..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </form>

              <div className="library-toolbar-right">
                <button
                  type="button"
                  className={`library-visibility-btn ${libraryPublic ? 'public' : 'private'}`}
                  onClick={handleVisibilityToggle}
                  disabled={visibilityLoading}
                  title={libraryPublic ? '현재 공개 — 클릭하면 비공개로 변경' : '현재 비공개 — 클릭하면 공개로 변경'}
                >
                  {libraryPublic ? '● 공개' : '○ 비공개'}
                </button>

                <button type="button" className="sort-btn">
                  최근순 정렬 ↕
                </button>
              </div>
            </div>

            {activeShelfId !== null && (
              <div className="library-shelf-header">
                <span>▤</span>
                <strong>{bookshelves.find((s) => s.id === activeShelfId)?.name}</strong>
                <em>{filteredBooks.length}권</em>
              </div>
            )}

            <div className="library-book-list">
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <div className="library-book-row" key={book.id}>
                    <Link to={`/books/${book.id}`} className="library-book-left">
                      {book.poster && book.poster !== DEFAULT_POSTER ? (
                        <img
                          src={book.poster}
                          alt={book.title}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div className={`library-book-fallback-cover ${FALLBACK_COLORS[Number(book.id) % FALLBACK_COLORS.length]}`}>
                          <span>{book.author || ''}</span>
                          <strong>{book.title}</strong>
                        </div>
                      )}

                      <div>
                        <h3>{book.title}</h3>
                        <p>{book.author || '작가 미상'}</p>
                      </div>
                    </Link>

                    <div className="library-book-actions">
                      <button
                        type="button"
                        className="book-status-btn"
                        onClick={() =>
                          setOpenMenuId((prev) => (prev === book.id ? null : book.id))
                        }
                      >
                        <span>{book.status ? statusIcons[book.status] : ''}</span>
                        {book.status ? statusLabels[book.status] : '상태 선택'}
                      </button>

                      <button
                        type="button"
                        className="book-more-btn"
                        onClick={() =>
                          setOpenMenuId((prev) => (prev === book.id ? null : book.id))
                        }
                      >
                        ⋮
                      </button>

                      {openMenuId === book.id && (
                        <div className="book-status-menu">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(book.id, 'want')}
                          >
                            <span>{statusIcons.want}</span>
                            읽고 싶은 책
                            <em>{book.status === 'want' ? '●' : '○'}</em>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(book.id, 'reading')}
                          >
                            <span>{statusIcons.reading}</span>
                            읽는 중
                            <em>{book.status === 'reading' ? '●' : '○'}</em>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(book.id, 'stopped')}
                          >
                            <span>{statusIcons.stopped}</span>
                            중단한 책
                            <em>{book.status === 'stopped' ? '●' : '○'}</em>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(book.id, 'finished')}
                          >
                            <span>{statusIcons.finished}</span>
                            완독
                            <em>{book.status === 'finished' ? '●' : '○'}</em>
                          </button>

                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="library-empty">
                  {activeShelfId !== null ? (
                    <p>이 책장에 아직 책이 없습니다.</p>
                  ) : activeFilter !== 'all' ? (
                    <p>해당 상태의 책이 없습니다.</p>
                  ) : (
                    <>
                      <p>서재에 책이 없습니다.</p>
                      <p>책 상세 페이지에서 독서 상태를 설정하면 서재에 추가됩니다.</p>
                      <Link to="/explore">도서 둘러보기</Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default LibraryPage;
