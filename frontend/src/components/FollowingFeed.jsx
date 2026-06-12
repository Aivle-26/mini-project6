import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFollowingFeed, toggleFeedLike, getFeedComments, addFeedComment } from '../api/feedApi';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_POSTER, FALLBACK_COLORS, STATUS_LABELS } from '../constants';

const actionLabel = (action) => {
  if (action === 'reading') return '님이 읽기 시작했습니다.';
  if (action === 'finished') return '님이 완독했습니다.';
  if (action === 'stopped') return '님이 독서를 중단했습니다.';
  if (action === 'want') return '님이 읽고 싶은 책으로 등록했습니다.';
  return '님이 독서 상태를 변경했습니다.';
};

const timeAgo = (isoString) => {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
};

export default function FollowingFeed({ loading: booksLoading }) {
  const { user } = useAuth();

  const [feeds, setFeeds] = useState([]);
  const [openCommentFeedId, setOpenCommentFeedId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [mutedFeedIds, setMutedFeedIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('mutedFeedIds') || '[]')); }
    catch { return new Set(); }
  });

  useEffect(() => {
    if (!user?.id) return;
    getFollowingFeed(user.id)
      .then((data) => {
        setFeeds(data.map((item) => ({
          id: item.id,
          user: {
            username: item.user.username,
            nickname: item.user.nickname,
            profileText: (item.user.nickname || item.user.username || '?')[0],
            profileImage: item.user.profileImage,
          },
          actionText: actionLabel(item.action),
          time: timeAgo(item.createdAt),
          book: {
            id: item.book.id,
            title: item.book.title,
            author: item.book.author || '작가 미상',
            poster: item.book.poster || DEFAULT_POSTER,
            status: item.action,
          },
          liked: false,
          likesCount: item.likeCount || 0,
          comments: [],
        })));
      })
      .catch(console.error);
  }, [user]);

  useEffect(() => {
    if (!openCommentFeedId) return;
    getFeedComments(openCommentFeedId)
      .then((comments) => {
        setFeeds((prev) => prev.map((f) => (f.id === openCommentFeedId ? { ...f, comments } : f)));
      })
      .catch(console.error);
  }, [openCommentFeedId]);

  const handleToggleLike = async (feedId) => {
    if (user?.id) {
      try { await toggleFeedLike(feedId, user.id); }
      catch (e) { console.error('피드 좋아요 실패:', e); }
    }
    setFeeds((prev) => prev.map((feed) =>
      feed.id === feedId
        ? { ...feed, liked: !feed.liked, likesCount: feed.liked ? Math.max(0, feed.likesCount - 1) : feed.likesCount + 1 }
        : feed
    ));
  };

  const handleToggleMute = (feedId) => {
    setMutedFeedIds((prev) => {
      const next = new Set(prev);
      if (next.has(feedId)) next.delete(feedId); else next.add(feedId);
      localStorage.setItem('mutedFeedIds', JSON.stringify([...next]));
      return next;
    });
  };

  const handleShare = (feed) => {
    navigator.clipboard?.writeText(`${feed.book.title} - ${feed.book.author}`);
    alert('공유할 책 정보가 복사되었습니다.');
  };

  const handleSubmitComment = async (feedId) => {
    const commentText = commentInputs[feedId]?.trim();
    if (!commentText) return;
    if (!user?.id) { alert('로그인 후 댓글을 작성할 수 있습니다.'); return; }
    try {
      const savedComment = await addFeedComment(feedId, {
        userId: user.id,
        username: user.nickname || user.username || '익명',
        content: commentText,
      });
      setFeeds((prev) => prev.map((feed) =>
        feed.id === feedId ? { ...feed, comments: [...(feed.comments || []), savedComment] } : feed
      ));
    } catch (e) {
      console.error('댓글 등록 실패:', e);
      alert('댓글 등록에 실패했습니다.');
    }
    setCommentInputs((prev) => ({ ...prev, [feedId]: '' }));
  };

  const visibleFeeds = feeds.filter((f) => !mutedFeedIds.has(f.id));

  return (
    <section className="home-right">
      <div className="home-block-title">
        <h2>Following</h2>
        <Link to="/people">사람 찾기</Link>
      </div>

      {booksLoading ? (
        <p className="feed-empty-text">피드를 불러오는 중입니다.</p>
      ) : visibleFeeds.length > 0 ? (
        <div className="following-feed-list">
          {visibleFeeds.map((feed) => (
            <article className="following-feed-card" key={feed.id}>
              <div className="feed-top-row">
                <Link to={`/users/${feed.user.username}`} className="feed-user-avatar">
                  {feed.user.profileImage
                    ? <img src={feed.user.profileImage} alt={feed.user.nickname} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : feed.user.profileText}
                </Link>
                <div className="feed-user-text">
                  <p>
                    <Link to={`/users/${feed.user.username}`}>{feed.user.nickname}</Link>
                    {feed.actionText}
                  </p>
                </div>
                <time>{feed.time}</time>
              </div>

              <div className="feed-book-card">
                <Link
                  to={String(feed.book.id).startsWith('sample') ? '/explore' : `/books/${feed.book.id}`}
                  className="feed-book-cover"
                >
                  {feed.book.poster && feed.book.poster !== DEFAULT_POSTER ? (
                    <img src={feed.book.poster} alt={feed.book.title} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <div className={`feed-book-fallback-cover ${FALLBACK_COLORS[Number(feed.book.id) % FALLBACK_COLORS.length]}`}>
                      <span>{feed.book.author || ''}</span>
                      <strong>{feed.book.title}</strong>
                    </div>
                  )}
                </Link>
                <div className="feed-book-info">
                  <Link to={String(feed.book.id).startsWith('sample') ? '/explore' : `/books/${feed.book.id}`}>
                    {feed.book.title}
                  </Link>
                  <p>{feed.book.author || '작가 미상'}</p>
                  <div className="feed-status-wrap">
                    <span className="feed-status-badge">{STATUS_LABELS[feed.book.status] || '상태 선택'}</span>
                  </div>
                </div>
              </div>

              <div className="feed-action-bar">
                <div>
                  <button type="button" className={feed.liked ? 'active' : ''} onClick={() => handleToggleLike(feed.id)}>
                    ♡ 좋아요 {feed.likesCount > 0 ? feed.likesCount : ''}
                  </button>
                  <button type="button" onClick={() => setOpenCommentFeedId((prev) => prev === feed.id ? null : feed.id)}>
                    ▱ 댓글 {feed.comments.length > 0 ? feed.comments.length : ''}
                  </button>
                </div>
                <div>
                  <button type="button" onClick={() => handleShare(feed)}>⤴ 공유</button>
                  <button type="button" onClick={() => handleToggleMute(feed.id)}>
                    ⋮ {mutedFeedIds.has(feed.id) ? '알림 켜기' : '알림 끄기'}
                  </button>
                </div>
              </div>

              {openCommentFeedId === feed.id && (
                <div className="feed-comment-box">
                  {feed.comments.length > 0 && (
                    <div className="feed-comment-list">
                      {feed.comments.map((comment) => (
                        <p key={comment.id}>
                          <strong>{comment.username || '익명'}</strong>
                          {comment.content}
                        </p>
                      ))}
                    </div>
                  )}
                  <div className="feed-comment-input-row">
                    <input
                      type="text"
                      value={commentInputs[feed.id] || ''}
                      onChange={(e) => setCommentInputs((prev) => ({ ...prev, [feed.id]: e.target.value }))}
                      placeholder="댓글을 입력하세요"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitComment(feed.id); }}
                    />
                    <button type="button" onClick={() => handleSubmitComment(feed.id)}>등록</button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="feed-empty-box">
          <p>아직 표시할 활동이 없습니다.</p>
          <span>다른 사용자를 팔로우하면 독서 활동이 여기에 표시됩니다.</span>
          <div><Link to="/people">사람 찾기</Link></div>
        </div>
      )}
    </section>
  );
}
