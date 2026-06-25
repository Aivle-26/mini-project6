import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../styles/UserProfilePage.css';
import { useFollow } from '../context/FollowContext';
import { useAuth } from '../context/AuthContext';
import { getUserBooks, getUserProfile } from '../api/usersApi';
import { getMyBooks } from '../api/booksApi';
import { getReviewsByUserId } from '../api/reviewsApi';
import { DEFAULT_POSTER } from '../constants';

function UserProfilePage() {
  const { username } = useParams();
  const { isFollowing, toggleFollow } = useFollow();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [userBooks, setUserBooks] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [booksError, setBooksError] = useState('');
  const [reviewsError, setReviewsError] = useState('');
  const [activeTab, setActiveTab] = useState('books');

  useEffect(() => {
    if (!username) return;

    const loadProfile = async () => {
      setLoading(true);
      setPageError('');
      setBooksError('');
      setReviewsError('');

      try {
        const profile = await getUserProfile(username);
        const isOwnProfile = currentUser?.id === profile.id || currentUser?.username === username;

        setProfileUser(profile);

        const [booksResult, reviewsResult] = await Promise.allSettled([
          isOwnProfile ? getMyBooks(profile.id) : getUserBooks(profile.id),
          getReviewsByUserId(profile.id),
        ]);

        if (booksResult.status === 'fulfilled') {
          setUserBooks(Array.isArray(booksResult.value) ? booksResult.value : []);
        } else {
          setUserBooks([]);
          setBooksError(booksResult.reason?.message || '서재를 불러오지 못했습니다.');
        }

        if (reviewsResult.status === 'fulfilled') {
          setUserReviews(Array.isArray(reviewsResult.value) ? reviewsResult.value : []);
        } else {
          setUserReviews([]);
          setReviewsError(reviewsResult.reason?.message || '리뷰를 불러오지 못했습니다.');
        }
      } catch (error) {
        setPageError(error.message || '사용자 정보를 불러오지 못했습니다.');
        setProfileUser(null);
        setUserBooks([]);
        setUserReviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username, currentUser?.id, currentUser?.username]);

  if (loading) {
    return <main className="user-profile-page"><p style={{ padding: '48px' }}>불러오는 중...</p></main>;
  }

  if (pageError || !profileUser) {
    return <main className="user-profile-page"><p style={{ padding: '48px' }}>{pageError || '사용자를 찾을 수 없습니다.'}</p></main>;
  }

  const following = isFollowing(username);
  const isOwnProfile = currentUser?.id === profileUser.id || currentUser?.username === username;

  const currentlyReading = userBooks.filter((b) => b.readingStatus === 'reading');
  const wantToRead = userBooks.filter((b) => b.readingStatus === 'want');
  const finishedBooks = userBooks.filter((b) => b.readingStatus === 'finished');
  const bookById = new Map(userBooks.map((book) => [String(book.id), book]));

  const renderBookGrid = (books) => {
    if (books.length === 0) {
      return <p className="profile-empty-state">표시할 책이 없습니다.</p>;
    }

    return (
      <div className="profile-book-grid">
        {books.map((book) => (
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
    );
  };

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
            "{profileUser.bio || '소개 문구가 아직 없습니다.'}"
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
        {isOwnProfile && (
          <button type="button" onClick={() => navigate('/goals')}>
            목표
          </button>
        )}
      </nav>

      {activeTab === 'books' ? (
        <>
          {booksError && <p className="profile-empty-state">{booksError}</p>}

          <section className="profile-section">
            <div className="profile-section-title">
              <h2>읽는 중</h2>
              <span>{currentlyReading.length}권</span>
            </div>

            {currentlyReading.length > 0 ? (
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
            ) : (
              <p className="profile-empty-state">현재 읽고 있는 책이 없습니다.</p>
            )}
          </section>

          <section className="profile-section">
            <div className="profile-section-title">
              <div>
                <h2>읽고 싶은 책</h2>
                <span>{wantToRead.length}권</span>
              </div>

              {isOwnProfile && <Link to="/library">전체 보기</Link>}
            </div>

            {renderBookGrid(wantToRead)}
          </section>

          <section className="profile-section">
            <div className="profile-section-title">
              <div>
                <h2>완독한 책</h2>
                <span>{finishedBooks.length}권</span>
              </div>

              {isOwnProfile && <Link to="/library">전체 보기</Link>}
            </div>

            {renderBookGrid(finishedBooks)}
          </section>
        </>
      ) : (
        <section className="profile-section">
          <div className="profile-section-title">
            <h2>작성한 리뷰</h2>
            <span>{userReviews.length}개</span>
          </div>

          {reviewsError && <p className="profile-empty-state">{reviewsError}</p>}

          {!reviewsError && userReviews.length === 0 && (
            <p className="profile-empty-state">아직 작성한 리뷰가 없습니다.</p>
          )}

          {!reviewsError && userReviews.length > 0 && (
            <div className="profile-review-list">
              {userReviews.map((review) => {
                const bookInfo = bookById.get(String(review.bookId));
                const title = bookInfo?.title || '책 정보 없음';
                const author = bookInfo?.author || '저자 정보 없음';
                const poster = bookInfo?.poster || DEFAULT_POSTER;

                return (
                  <div key={review.id} className="profile-review-item">
                    <Link to={`/books/${review.bookId}`}>
                      <img
                        src={poster}
                        alt={title}
                        onError={(e) => { e.currentTarget.src = DEFAULT_POSTER; }}
                      />
                    </Link>

                    <div className="profile-review-content">
                      <div>
                        <div className="profile-review-header">
                          <div>
                            <Link to={`/books/${review.bookId}`} className="profile-review-title">
                              {title}
                            </Link>
                            <p>{author}</p>
                          </div>

                          <span>{review.createdAt || '날짜 없음'}</span>
                        </div>

                        <div className="profile-review-rating">
                          {'★'.repeat(review.rating || 0)}
                          <span>{review.rating || 0}점</span>
                        </div>

                        <p className="profile-review-body">
                          {review.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default UserProfilePage;
