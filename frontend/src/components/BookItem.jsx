import { Link } from 'react-router-dom';
import { DEFAULT_POSTER, FALLBACK_COLORS } from '../constants';

function BookItem({
  id,
  title,
  author,
  description,
  publishedDate,
  modifiedDate,
  genre,
  poster,
  likes = 0,
  averageRating = 0,
  reviewCount = 0,
  onLike,
  onDelete,
  compact = false,
}) {
  if (compact) {
    return (
      <li className="book-card book-card--compact">
        <Link to={`/books/${id}`} className="book-link">
          {poster && poster !== DEFAULT_POSTER ? (
            <img
              src={poster}
              alt={title}
              className="book-poster"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className={`book-poster-fallback ${FALLBACK_COLORS[Number(id) % FALLBACK_COLORS.length]}`}>
              <span>{author || ''}</span>
              <strong>{title}</strong>
            </div>
          )}

          <div className="book-info">
            <h3>{title}</h3>
            <div className="book-rating-summary">
              {reviewCount > 0 ? (
                <><span>⭐ {averageRating}</span><small>({reviewCount})</small></>
              ) : (
                <small>⭐ 리뷰 없음</small>
              )}
            </div>
          </div>
        </Link>
      </li>
    );
  }

  return (
    <li className="book-card">
      <Link to={`/books/${id}`} className="book-link">
        {poster && poster !== DEFAULT_POSTER ? (
          <img
            src={poster}
            alt={title}
            className="book-poster"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className={`book-poster-fallback ${FALLBACK_COLORS[Number(id) % FALLBACK_COLORS.length]}`}>
            <span>{author || ''}</span>
            <strong>{title}</strong>
          </div>
        )}

        <div className="book-info">
          <h3>{title}</h3>

          <div className="book-meta-row">
            {author && <p className="author">작가: {author}</p>}
            {genre && <span className="genre-badge">{genre}</span>}
          </div>

          <div className="book-rating-summary">
            {reviewCount > 0 ? (
              <>
                <span>⭐ {averageRating}</span>
                <small>리뷰 {reviewCount}개</small>
              </>
            ) : (
              <small>⭐ 리뷰 없음</small>
            )}
          </div>

          {description && <p className="description">{description}</p>}
          {publishedDate && <p className="date">출판일: {publishedDate}</p>}
          {modifiedDate && <p className="date">수정일: {modifiedDate}</p>}
        </div>
      </Link>

      <div className="book-actions">
        <button onClick={() => onLike?.(id)} className="like-btn">
          👍 {likes}
        </button>

        <button
          onClick={() => {
            const isConfirmed = window.confirm("정말 이 도서를 휴지통으로 이동하시겠습니까?");
            if (isConfirmed) {
              onDelete?.(id);
            }
          }}
          className="delete-btn"
        >
          삭제
        </button>
      </div>
    </li>
  );
}

export default BookItem;
