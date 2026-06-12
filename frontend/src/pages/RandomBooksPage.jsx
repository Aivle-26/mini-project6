import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getRandomBooks } from '../api/booksApi';
import BookCover from '../components/BookCover';
import '../styles/RandomBooksPage.css';

function RandomBooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRandom = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRandomBooks(20);
      setBooks(data);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRandom();
  }, [fetchRandom]);

  return (
    <main className="rand-page">
      <div className="rand-inner">
        <div className="rand-header">
          <div>
            <p className="rand-label">랜덤 책 둘러보기</p>
            <h1 className="rand-title">오늘은 어떤 책을 읽을까요?</h1>
            <p className="rand-desc">등록된 도서 중 무작위로 선별했습니다.</p>
          </div>
          <button
            className="rand-refresh-btn"
            onClick={fetchRandom}
            disabled={loading}
          >
            {loading ? '선별 중...' : '다시 뽑기'}
          </button>
        </div>

        {loading ? (
          <p className="rand-loading">책을 고르는 중...</p>
        ) : books.length === 0 ? (
          <div className="rand-empty">
            <p>표시할 도서가 없습니다.</p>
            <Link to="/add-book">첫 번째 책을 등록해보세요 →</Link>
          </div>
        ) : (
          <div className="rand-grid">
            {books.map((book) => (
              <Link to={`/books/${book.id}`} className="rand-card" key={book.id}>
                <BookCover book={book} coverClass="rand-cover" />
                <div className="rand-card-info">
                  <h3 className="rand-card-title">{book.title}</h3>
                  {book.author && <p className="rand-card-author">{book.author}</p>}
                  {book.genre && <span className="rand-card-genre">{book.genre}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default RandomBooksPage;
