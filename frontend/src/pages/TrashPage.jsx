import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTrashBooks, restoreBook, permanentlyDeleteBook } from '../api/booksApi';
import '../styles/TrashPage.css';
import { DEFAULT_POSTER } from '../constants';

const TRASH_KEEP_DAYS = 30;

function TrashPage() {
  const [trashBooks, setTrashBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const getDaysLeft = (deletedAt) => {
    if (!deletedAt) return TRASH_KEEP_DAYS;

    const deletedTime = new Date(deletedAt).getTime();
    const now = new Date().getTime();
    const diffDays = Math.floor((now - deletedTime) / (1000 * 60 * 60 * 24));

    return Math.max(TRASH_KEEP_DAYS - diffDays, 0);
  };

  const isExpired = (deletedAt) => {
    return getDaysLeft(deletedAt) <= 0;
  };

  useEffect(() => {
    async function loadTrashBooks() {
      try {
        const books = await getTrashBooks();

        const expiredBooks = books.filter((book) => isExpired(book.deletedAt));
        const validTrashBooks = books.filter((book) => !isExpired(book.deletedAt));

        await Promise.all(
          expiredBooks.map((book) => permanentlyDeleteBook(book.id))
        );

        setTrashBooks(validTrashBooks);
      } catch (err) {
        console.error('휴지통 불러오기 실패:', err);
        alert('휴지통을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    loadTrashBooks();
  }, []);

  const handleRestore = async (id) => {
    try {
      await restoreBook(id);

      setTrashBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
      alert('도서가 복구되었습니다.');
    } catch (err) {
      console.error('복구 실패:', err);
      alert('도서 복구 중 오류가 발생했습니다.');
    }
  };

  const handlePermanentDelete = async (id) => {
    const isConfirmed = window.confirm(
      '정말 완전히 삭제하시겠습니까?\n완전 삭제된 도서는 복구할 수 없습니다.'
    );

    if (!isConfirmed) return;

    try {
      await permanentlyDeleteBook(id);

      setTrashBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
      alert('도서가 완전히 삭제되었습니다.');
    } catch (err) {
      console.error('완전 삭제 실패:', err);
      alert('완전 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return <p className="loading">휴지통 불러오는 중...</p>;
  }

  return (
    <div className="trash-page">
      <div className="page-header">
        <h1>🗑️ 휴지통</h1>
        <p>삭제된 도서는 30일 동안 보관되며, 이후 자동으로 완전히 삭제됩니다.</p>
      </div>

      {trashBooks.length === 0 ? (
        <div className="empty-trash">
          <h2>휴지통이 비어 있습니다.</h2>
          <p>삭제한 도서가 이곳에 표시됩니다.</p>

          <Link to="/books" className="back-list-link">
            도서 목록으로 이동
          </Link>
        </div>
      ) : (
        <div className="trash-grid">
          {trashBooks.map((book) => (
            <div key={book.id} className="trash-card">
              <img
                src={book.poster || DEFAULT_POSTER}
                alt={book.title}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_POSTER;
                }}
              />

              <div className="trash-info">
                <h3>{book.title}</h3>

                <p className="trash-author">
                  작가: {book.author || '작가 미상'}
                </p>

                <p className="trash-date">
                  삭제일: {book.deletedAt ? String(book.deletedAt).slice(0, 10) : '-'}
                </p>

                <p className="trash-left-days">
                  남은 보관 기간: <strong>{getDaysLeft(book.deletedAt)}</strong>일
                </p>
              </div>

              <div className="trash-actions">
                <button
                  type="button"
                  className="restore-btn"
                  onClick={() => handleRestore(book.id)}
                >
                  복구
                </button>

                <button
                  type="button"
                  className="permanent-delete-btn"
                  onClick={() => handlePermanentDelete(book.id)}
                >
                  완전 삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrashPage;
