import { useCallback, useEffect, useMemo, useState } from 'react';
import { addToLibrary, getBooks, getMyBooks, updateReadingStatus } from '../api/booksApi';
import '../styles/Home.css';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_POSTER } from '../constants';
import HomeLeftPanel from '../components/HomeLeftPanel';
import FollowingFeed from '../components/FollowingFeed';

const sampleRecommendedBooks = [
  { id: 'sample-1', title: '조용한 서재의 밤', author: '책담', genre: '에세이', poster: DEFAULT_POSTER },
  { id: 'sample-2', title: '오늘의 문장', author: '책담', genre: '소설', poster: DEFAULT_POSTER },
  { id: 'sample-3', title: '다시 읽고 싶은 책', author: '책담', genre: '인문', poster: DEFAULT_POSTER },
];

const bookIdentity = (book) =>
  (book.isbn?.trim()
    ? `isbn:${book.isbn.trim()}`
    : `book:${book.title || ''}|${book.author || ''}`).toLowerCase();

const getUniqueBooks = (bookList) => {
  const uniqueBooks = new Map();

  bookList.forEach((book) => {
    const key = bookIdentity(book);
    const existing = uniqueBooks.get(key);

    if (!existing || (book.likes || 0) > (existing.likes || 0)) {
      uniqueBooks.set(key, book);
    }
  });

  return [...uniqueBooks.values()];
};

function Home() {
  const { user } = useAuth();

  const [books, setBooks] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readingActionLoading, setReadingActionLoading] = useState(false);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBooks();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('도서 목록 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMyBooks = useCallback(async () => {
    if (!user?.id) {
      setMyBooks([]);
      return;
    }

    try {
      const data = await getMyBooks(user.id);
      setMyBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('내 서재 불러오기 실패:', error);
      setMyBooks([]);
    }
  }, [user?.id]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  useEffect(() => {
    loadMyBooks();
  }, [loadMyBooks]);

  const readingBooks = useMemo(
    () => myBooks.filter((book) => book.readingStatus === 'reading'),
    [myBooks]
  );

  const readingCandidateBooks = useMemo(() => {
    const myBookIds = new Set(myBooks.map((book) => String(book.id)));
    const myBookKeys = new Set(myBooks.map(bookIdentity));
    const normalizedBooks = books.filter((book) => !String(book.id).startsWith('sample'));

    const ownCandidates = myBooks
      .filter((book) => book.readingStatus !== 'reading')
      .map((book) => ({ ...book, source: 'mine' }));

    const publicCandidates = normalizedBooks
      .filter((book) => String(book.userId) !== String(user?.id))
      .filter((book) => !myBookIds.has(String(book.id)))
      .filter((book) => !myBookKeys.has(bookIdentity(book)))
      .map((book) => ({ ...book, source: 'public' }));

    return [...ownCandidates, ...publicCandidates];
  }, [books, myBooks, user?.id]);

  const handleStartReading = async (book) => {
    if (!user?.id) {
      alert('로그인 후 책을 읽는 중으로 추가할 수 있습니다.');
      return;
    }

    setReadingActionLoading(true);
    try {
      const targetBook = book.source === 'public'
        ? await addToLibrary(book.id, user.id)
        : book;

      await updateReadingStatus(targetBook.id, 'reading', user.id);
      await Promise.all([loadBooks(), loadMyBooks()]);
    } catch (error) {
      console.error('읽는 중 추가 실패:', error);
      alert(error.message || '읽는 중 목록에 추가하지 못했습니다.');
    } finally {
      setReadingActionLoading(false);
    }
  };

  const recommendedBooks = useMemo(() => {
    if (books.length === 0) return sampleRecommendedBooks;

    return getUniqueBooks(books)
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 3);
  }, [books]);

  return (
    <main className="home-page">
      <div className="home-layout">
        <HomeLeftPanel
          recommendedBooks={recommendedBooks}
          readingBooks={readingBooks}
          readingCandidateBooks={readingCandidateBooks}
          onStartReading={handleStartReading}
          readingActionLoading={readingActionLoading}
        />
        <FollowingFeed loading={loading} />
      </div>
    </main>
  );
}

export default Home;
