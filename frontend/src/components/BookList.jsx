import BookItem from './BookItem';
import '../styles/BookList.css';

function BookList({ books = [], onDelete, onLike, compact = false }) {
  return (
    <div className={`book-list${compact ? ' book-list--compact' : ''}`}>
      {books.length === 0 ? (
        <p className="empty-message">등록된 도서가 없습니다.</p>
      ) : (
        <ul className="books-grid">
          {books.map((book) => (
            <BookItem
              key={book.id}
              id={book.id}
              title={book.title}
              author={book.author}
              description={book.description}
              publishedDate={book.publishedDate}
              modifiedDate={book.modifiedDate}
              genre={book.genre}
              poster={book.poster}
              likes={book.likes}
              averageRating={book.averageRating}
              reviewCount={book.reviewCount}
              onDelete={onDelete}
              onLike={onLike}
              compact={compact}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default BookList;