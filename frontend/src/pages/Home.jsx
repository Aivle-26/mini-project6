import { useEffect, useState } from 'react';
import { getBooks, getMyBooks } from '../api/booksApi';
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

function Home() {
  const { user } = useAuth();

  const [books, setBooks] = useState([]);
  const [readingBooks, setReadingBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBooks()
      .then(setBooks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    getMyBooks(user.id)
      .then((data) => setReadingBooks(data.filter((b) => b.readingStatus === 'reading')))
      .catch(() => {});
  }, [user]);

  const recommendedBooks = books.length > 0
    ? [...books].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 3)
    : sampleRecommendedBooks;

  return (
    <main className="home-page">
      <div className="home-layout">
        <HomeLeftPanel recommendedBooks={recommendedBooks} readingBooks={readingBooks} />
        <FollowingFeed loading={loading} />
      </div>
    </main>
  );
}

export default Home;
