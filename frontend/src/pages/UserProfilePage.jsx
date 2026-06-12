import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../styles/UserProfilePage.css';
import { useFollow } from '../context/FollowContext';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../api/usersApi';
import { getMyBooks } from '../api/booksApi';
import { DEFAULT_POSTER } from '../constants';

function UserProfilePage() {
  const { username } = useParams();
  const { isFollowing, toggleFollow } = useFollow();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [userBooks, setUserBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('books');

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    getUserProfile(username)
      .then((profile) => {
        setProfileUser(profile);
        return getMyBooks(profile.id);
      })
      .then((books) => setUserBooks(books))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [username]);

  if (loading || !profileUser) {
    return <main className="user-profile-page"><p style={{ padding: '48px' }}>불러오는 중...</p></main>;
  }

  const following = isFollowing(username);

  const currentlyReading = userBooks.filter((b) => b.readingStatus === 'reading');
  const wantToRead = userBooks.filter((b) => b.readingStatus === 'want');
  const finishedBooks = userBooks.filter((b) => b.readingStatus === 'finished');

  const isOwnProfile = currentUser?.username === username;

  const mockReviews = [
    {
      id: 'mock-review-1',
      rating: 5,
      content: '재밌어요. 몰입력도 높고 4시간이면 완독할 수 있어요 !',
      createdAt: '2026-06-11',
      bookInfo: { id: 'mock-book-1', title: '모순', author: '양귀자', poster: DEFAULT_POSTER },
    },
    {
      id: 'mock-review-2',
      rating: 4,
      content: '굿굿 \'~\'',
      createdAt: '2026-06-10',
      modifiedAt: '2026-06-11',
      bookInfo: { id: 'mock-book-2', title: '어린 왕자', author: '앙투안 드 생텍쥐페리', poster: DEFAULT_POSTER },
    },
  ];

  const fetchedReviews = userBooks.reduce((acc, book) => {
    if (book.reviews && Array.isArray(book.reviews)) {
      const bookReviews = book.reviews.map((review) => ({
        ...review,
        bookInfo: { id: book.id, title: book.title, author: book.author, poster: book.poster || DEFAULT_POSTER },
      }));
      return [...acc, ...bookReviews];
    }
    return acc;
  }, []);

  const userReviews = fetchedReviews.length > 0 ? fetchedReviews : mockReviews;

  return (
    <main className="user-profile-page">
      <section className="user-profile-hero">
        <div className="profile-handle">
          @{username}
        </div>

        <div className="profile-center">
          <div className="profile-image">
            {profileUser.profileImage ? (
              <img src={profileUser.profileImage} alt={profileUser.nickname} />
            ) : (
              <span>{profileUser.nickname?.slice(0, 1)}</span>
            )}
          </div>

          <h1>{profileUser.nickname}</h1>

          <p>
            "{profileUser.bio || ''}"
          </p>
        </div>

        <div className="profile-follow-area">
          <div className="profile-counts">
            <span>
              <strong>{profileUser.followingCount}</strong>
              팔로잉
            </span>

            <span>
              <strong>{profileUser.followerCount}</strong>
              팔로워
            </span>
          </div>

          {!isOwnProfile && (
            <button
              type="button"
              className={following ? 'following-btn active' : 'following-btn'}
              onClick={() => toggleFollow(username, profileUser.id)}
            >
              {following ? '팔로잉' : '팔로우'}
            </button>
          )}

          {isOwnProfile && (
            <Link to="/profile/edit" className="following-btn profile-edit-link">
              프로필 편집
            </Link>
          )}
        </div>
      </section>

      <nav className="profile-tabs">
        <button
          type="button"
          className={activeTab === 'books' ? 'active' : ''}
          onClick={() => setActiveTab('books')}
        >
          책
        </button>
        <button
          type="button"
          className={activeTab === 'reviews' ? 'active' : ''}
          onClick={() => setActiveTab('reviews')}
        >
          리뷰
        </button>
        <button type="button" onClick={() => navigate('/goals')}>
          목표
        </button>
      </nav>

      {activeTab === 'books' ? (
        <>
          <section className="profile-section">
            <div className="profile-section-title">
              <h2>읽는 중</h2>
              <span>{currentlyReading.length}권</span>
            </div>

            <div className="current-book-box">
              {currentlyReading.map((book) => (
                <Link to={`/books/${book.id}`} className="current-book-card" key={book.id}>
                  <img
                    src={book.poster || DEFAULT_POSTER}
                    alt={book.title}
                    onError={(e) => { e.currentTarget.src = DEFAULT_POSTER; }}
                  />

                  <div>
                    <h3>{book.title}</h3>
                    <p>{book.author}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="profile-section">
            <div className="profile-section-title">
              <div>
                <h2>읽고 싶은 책</h2>
                <span>{wantToRead.length}권</span>
              </div>

              <Link to="/library">전체 보기</Link>
            </div>

            <div className="profile-book-grid">
              {wantToRead.map((book) => (
                <Link to={`/books/${book.id}`} className="profile-book-card" key={book.id}>
                  <img
                    src={book.poster || DEFAULT_POSTER}
                    alt={book.title}
                    onError={(e) => { e.currentTarget.src = DEFAULT_POSTER; }}
                  />

                  <h3>{book.title}</h3>
                  <p>{book.author}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="profile-section">
            <div className="profile-section-title">
              <div>
                <h2>완독한 책</h2>
                <span>{finishedBooks.length}권</span>
              </div>

              <Link to="/library">전체 보기</Link>
            </div>

            <div className="profile-book-grid">
              {finishedBooks.map((book) => (
                <Link to={`/books/${book.id}`} className="profile-book-card" key={book.id}>
                  <img
                    src={book.poster || DEFAULT_POSTER}
                    alt={book.title}
                    onError={(e) => { e.currentTarget.src = DEFAULT_POSTER; }}
                  />

                  <h3>{book.title}</h3>
                  <p>{book.author}</p>
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="profile-section">
          <div className="profile-section-title">
            <h2>작성한 리뷰</h2>
            <span>{userReviews.length}개</span>
          </div>

          <div className="profile-review-list" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {userReviews.map((review) => (
              <div key={review.id} className="profile-review-item" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '24px', paddingBottom: '28px', borderBottom: '1px solid var(--line-main)' }}>
                <Link to={`/books/${review.bookInfo?.id}`}>
                  <img
                    src={review.bookInfo?.poster}
                    alt={review.bookInfo?.title}
                    style={{ width: '80px', height: '116px', objectFit: 'cover', background: 'var(--bg-soft)' }}
                  />
                </Link>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <Link to={`/books/${review.bookInfo?.id}`} style={{ textDecoration: 'none' }}>
                          <strong style={{ color: 'var(--text-main)', fontSize: '16px', fontWeight: '900' }}>{review.bookInfo?.title}</strong>
                        </Link>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-sub)', fontSize: '13px', fontWeight: '650' }}>{review.bookInfo?.author}</p>
                      </div>

                      <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600' }}>
                        {review.modifiedAt ? `${review.modifiedAt} (수정됨)` : review.createdAt}
                      </span>
                    </div>

                    <div style={{ margin: '8px 0', fontSize: '14px' }}>
                      {'⭐'.repeat(review.rating || 0)}
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginLeft: '4px' }}>{review.rating}점</span>
                    </div>

                    <p style={{ margin: '8px 0 0', color: 'var(--text-main)', fontSize: '15px', lineHeight: '1.6', fontWeight: '650', whiteSpace: 'pre-wrap' }}>
                      {review.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default UserProfilePage;
