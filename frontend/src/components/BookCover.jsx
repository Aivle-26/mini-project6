import { DEFAULT_POSTER, FALLBACK_COLORS } from '../constants';

export default function BookCover({ book, coverClass, size = '' }) {
  const color = FALLBACK_COLORS[Number(book.id) % FALLBACK_COLORS.length];
  const sizeClass = size ? ` ${size}` : '';

  if (book.poster && book.poster !== DEFAULT_POSTER) {
    return (
      <div className={`${coverClass}${sizeClass}`} style={{ padding: 0, overflow: 'hidden' }}>
        <img
          src={book.poster}
          alt={book.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>
    );
  }
  return (
    <div className={`${coverClass} ${color}${sizeClass}`}>
      <span>{book.author || ''}</span>
      <strong>{book.title}</strong>
    </div>
  );
}
