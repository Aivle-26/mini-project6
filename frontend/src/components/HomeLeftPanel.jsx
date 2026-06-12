import { Link } from 'react-router-dom';
import { useReadingGoal } from '../context/ReadingGoalContext';
import { DEFAULT_POSTER, FALLBACK_COLORS, STATUS_LABELS as statusLabels } from '../constants';

function renderBookItem(book) {
  const isSample = String(book.id).startsWith('sample');
  const colorIndex = isNaN(Number(book.id)) ? 0 : Number(book.id) % FALLBACK_COLORS.length;

  const bookContent = (
    <>
      {book.poster && book.poster !== DEFAULT_POSTER ? (
        <img src={book.poster} alt={book.title} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      ) : (
        <div className={`home-book-fallback-cover ${FALLBACK_COLORS[colorIndex]}`}>
          <span>{book.author || ''}</span>
          <strong>{book.title}</strong>
        </div>
      )}
      <div>
        <h3>{book.title}</h3>
        <p>{book.author || '작가 미상'}</p>
        <span>{book.genre || statusLabels[book.readingStatus] || '장르 없음'}</span>
      </div>
    </>
  );

  if (isSample) {
    return <div className="home-book-item" key={book.id}>{bookContent}</div>;
  }
  return <Link to={`/books/${book.id}`} className="home-book-item" key={book.id}>{bookContent}</Link>;
}

export default function HomeLeftPanel({ recommendedBooks, readingBooks }) {
  const { activeGoal } = useReadingGoal();
  const currentYear = new Date().getFullYear();

  return (
    <aside className="home-left">
      <section className="home-block">
        <div className="home-block-title">
          <h2>도서 등록</h2>
        </div>
        <div className="add-book-empty-box">
          <Link to="/add-book">책 추가하기</Link>
        </div>
      </section>

      <section className="home-block">
        <div className="home-block-title">
          <h2>추천도서</h2>
          <Link to="/explore">더보기</Link>
        </div>
        <div className="recommended-list">
          {recommendedBooks.map((book) => renderBookItem(book))}
        </div>
      </section>

      <section className="home-block">
        <div className="home-block-title">
          <h2>읽는 중</h2>
          <Link to="/add-book">책 추가</Link>
        </div>
        {readingBooks.length > 0 ? (
          <div className="currently-list">
            {readingBooks.map((book) => renderBookItem(book))}
          </div>
        ) : (
          <div className="empty-reading-box">
            <p>아직 읽는 중인 책이 없습니다.</p>
          </div>
        )}
      </section>

      <section className="home-block">
        <div className="home-block-title">
          <h2>독서 목표</h2>
        </div>
        {activeGoal ? (
          <Link to="/goals" className="goal-button">
            {activeGoal.year} {activeGoal.name} ({activeGoal.books.length} / {activeGoal.goalCount}권)
          </Link>
        ) : (
          <Link to="/goals" className="goal-button">{currentYear} 독서 목표 설정하기</Link>
        )}
      </section>

      <footer className="home-footer-links">
        <div>
          <Link to="/">공지사항</Link>
          <Link to="/">이용약관</Link>
          <Link to="/">개인정보처리방침</Link>
          <Link to="/">고객센터</Link>
        </div>
        <div>
          <Link to="/">인기 서재</Link>
          <Link to="/">공개 리뷰</Link>
          <Link to="/">AI 표지 갤러리</Link>
          <Link to="/">업데이트 기록</Link>
        </div>
      </footer>
    </aside>
  );
}
