import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addToLibrary, getBookById, moveBookToTrash, replaceBook, updateReadingStatus } from '../api/booksApi';
import { addHighlight, deleteHighlight, getHighlightsByBookId } from '../api/highlightsApi';
import { addReview, deleteReview, getReviewsByBookId, updateReview } from '../api/reviewsApi';
import { assignBookToShelf, getMyBookshelves } from '../api/bookshelfApi';
import { useAuth } from '../context/AuthContext';
import { useReadingGoal } from '../context/ReadingGoalContext';
import { DEFAULT_POSTER, STATUS_API_TO_LABEL, STATUS_LABEL_TO_API } from '../constants';
import BookDetailModals from '../components/BookDetailModals';
import BookDetailSidePanel from '../components/BookDetailSidePanel';
import '../styles/BookDetailPage.css';

const statusOptions = [
  { label: '읽고 싶은 책', icon: '＋' },
  { label: '읽는 중', icon: '▯' },
  { label: '중단한 책', icon: '∥' },
  { label: '완독', icon: '✓' },
];

const defaultForm = {
  title: '',
  author: '',
  description: '',
  publishedDate: '',
  genre: '소설',
  modifiedDate: '',
  createdDate: '',
  poster: '',
  likes: 0,
};

function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { onBookFinished } = useReadingGoal();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [bookshelves, setBookshelves] = useState([]);
  const [currentShelfId, setCurrentShelfId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(defaultForm);

  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [shelfSubMenuOpen, setShelfSubMenuOpen] = useState(false);
  const [bookStatus, setBookStatus] = useState('');
  const [activeDetailTab, setActiveDetailTab] = useState('reviews');

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [highlightModalOpen, setHighlightModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [selectedReviewTags, setSelectedReviewTags] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(0);

  const [highlightQuote, setHighlightQuote] = useState('');
  const [highlightNote, setHighlightNote] = useState('');
  const [highlightPage, setHighlightPage] = useState('');
  const [highlightSpoiler, setHighlightSpoiler] = useState(false);

  const [aiApiKey, setAiApiKey] = useState(() => localStorage.getItem('openaiApiKey') || '');
  const [showAiApiKey, setShowAiApiKey] = useState(false);
  const [aiPosters, setAiPosters] = useState([]);
  const [aiGenerating, setAiGenerating] = useState(false);

  const canManageBook = Boolean(user?.id);
  const editableUserId = book?.editableUserId ?? book?.originalUserId ?? book?.userId;
  const canEditBook = Boolean(user?.id && editableUserId === user.id);
  const detailBookId = book?.detailBookId || book?.originalBookId || book?.id || id;

  const loadDetailData = async (detailId = id) => {
    const [reviewData, highlightData] = await Promise.all([
      getReviewsByBookId(detailId),
      getHighlightsByBookId(detailId),
    ]);
    setReviews(Array.isArray(reviewData) ? reviewData : []);
    setHighlights(Array.isArray(highlightData) ? highlightData : []);
  };

  useEffect(() => {
    let ignore = false;

    async function loadBook() {
      setLoading(true);
      setError('');
      try {
        const data = await getBookById(id);
        if (ignore) return;

        setBook(data);
        setFormData({
          title: data.title || '',
          author: data.author || '',
          description: data.description || '',
          publishedDate: data.publishedDate || '',
          genre: data.genre || '소설',
          modifiedDate: data.modifiedDate || '',
          createdDate: data.createdDate || '',
          poster: data.poster || DEFAULT_POSTER,
          likes: data.likes || 0,
        });
        setBookStatus(STATUS_API_TO_LABEL[data.readingStatus] || '');
        setCurrentShelfId(data.bookshelfId || null);
        await loadDetailData(data.detailBookId || data.originalBookId || data.id || id);
      } catch (err) {
        console.error('상세 도서 불러오기 실패:', err);
        if (!ignore) setError(err.message || '도서를 불러오지 못했습니다.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadBook();
    return () => { ignore = true; };
  }, [id]);

  useEffect(() => {
    if (!user?.id) return;
    getMyBookshelves(user.id).then(setBookshelves).catch(() => {});
  }, [user?.id]);

  const getAverageRating = () => {
    if (reviews.length === 0) return '0.0';
    const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  };

  const getReviewText = (review) =>
    review.content || review.text || review.review || review.comment || '';

  const formatHighlightDate = (value) => {
    if (!value) return '날짜 없음';
    return String(value).slice(0, 10);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignShelf = async (shelfId) => {
    if (!canManageBook) return;
    try {
      await assignBookToShelf(id, shelfId, user.id);
      setCurrentShelfId(shelfId);
    } catch (err) {
      alert(err.message || '책장 배정에 실패했습니다.');
    }
  };

  const handleRemoveFromShelf = async () => {
    if (!canManageBook) return;
    try {
      await assignBookToShelf(id, null, user.id);
      setCurrentShelfId(null);
    } catch (err) {
      alert(err.message || '책장 해제에 실패했습니다.');
    }
  };

  const handleStatusChange = async (label) => {
    if (!canManageBook) return;

    const isSame = label === bookStatus;
    const apiValue = isSame ? null : STATUS_LABEL_TO_API[label];
    setBookStatus(isSame ? '' : label);
    setSideMenuOpen(false);

    try {
      const targetBook = book.userId === user.id
        ? book
        : await addToLibrary(detailBookId, user.id);
      const updated = await updateReadingStatus(targetBook.id, apiValue, user.id);
      setBook(updated);
      if (String(updated.id) !== String(id)) {
        navigate(`/books/${updated.id}`, { replace: true });
      }
      if (!isSame && apiValue === 'finished') onBookFinished(updated);
    } catch (err) {
      alert(err.message || '독서 상태 변경에 실패했습니다.');
    }
  };

  const handleAiGenerate = async () => {
    if (!canEditBook) return;
    if (!formData.title?.trim()) { alert('제목 정보가 없습니다.'); return; }
    if (!aiApiKey.trim()) { alert('OpenAI API 키를 입력해주세요.'); return; }

    setAiGenerating(true);
    setAiPosters([]);
    try {
      const res = await fetch('http://localhost:8080/ai/cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          genre: formData.genre,
          moods: book?.moods || [],
          description: formData.description || '도서 설명 없음',
          coverPrompt: '',
          apiKey: aiApiKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'AI 표지 생성 실패');
      const posters = Array.isArray(data.posters)
        ? data.posters.filter(Boolean)
        : data.poster ? [data.poster] : [];
      if (posters.length === 0) throw new Error('이미지 데이터가 없습니다.');
      setAiPosters(posters);
      setFormData((prev) => ({ ...prev, poster: posters[0] }));
    } catch (err) {
      alert(`AI 표지 생성에 실패했습니다.\n${err.message}`);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!canEditBook) return;
    if (!formData.title.trim()) { alert('제목을 입력하세요.'); return; }

    try {
      const today = new Date().toISOString().slice(0, 10);
      const updated = await replaceBook(id, {
        ...book,
        ...formData,
        poster: formData.poster || DEFAULT_POSTER,
        modifiedDate: today,
      }, user.id);
      setBook(updated);
      setFormData({
        title: updated.title || '',
        author: updated.author || '',
        description: updated.description || '',
        publishedDate: updated.publishedDate || '',
        genre: updated.genre || '소설',
        modifiedDate: updated.modifiedDate || '',
        createdDate: updated.createdDate || '',
        poster: updated.poster || DEFAULT_POSTER,
        likes: updated.likes || 0,
      });
      setIsEditing(false);
      setSaveMessage('도서 정보가 저장되었습니다.');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (err) {
      alert(err.message || '도서 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!canEditBook) return;
    if (!window.confirm('정말 이 도서를 휴지통으로 이동하시겠습니까?')) return;

    try {
      await moveBookToTrash(id, user.id);
      alert('도서가 휴지통으로 이동되었습니다.');
      navigate('/books');
    } catch (err) {
      alert(err.message || '도서 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      title: book.title || '',
      author: book.author || '',
      description: book.description || '',
      publishedDate: book.publishedDate || '',
      genre: book.genre || '소설',
      modifiedDate: book.modifiedDate || '',
      createdDate: book.createdDate || '',
      poster: book.poster || DEFAULT_POSTER,
      likes: book.likes || 0,
    });
    setIsEditing(false);
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    if (!user?.id) { alert('로그인 후 리뷰를 작성할 수 있습니다.'); return; }
    if (!reviewContent.trim()) { alert('리뷰 내용을 입력해주세요.'); return; }

    try {
      const saved = await addReview({
        bookId: Number(detailBookId),
        userId: user.id,
        writer: user.nickname || user.username || '익명',
        rating: reviewRating,
        content: reviewContent.trim(),
        createdAt: new Date().toISOString().slice(0, 10),
      });
      setReviews((prev) => [saved, ...prev]);
      setReviewRating(0);
      setReviewContent('');
      setSelectedReviewTags([]);
      setReviewModalOpen(false);
      setActiveDetailTab('reviews');
    } catch (err) {
      alert(err.message || '리뷰 등록 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateReview = async (reviewId) => {
    if (!editContent.trim()) return;

    try {
      const updated = await updateReview(reviewId, {
        content: editContent.trim(),
        rating: editRating,
        writer: user?.nickname || user?.username || '익명',
      }, user?.id);
      setReviews((prev) => prev.map((review) => (review.id === reviewId ? updated : review)));
      setEditingReviewId(null);
    } catch (err) {
      alert(err.message || '리뷰 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('정말 이 리뷰를 삭제하시겠습니까?')) return;

    try {
      await deleteReview(reviewId, user?.id);
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
    } catch (err) {
      alert(err.message || '리뷰 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleSubmitHighlight = async (event) => {
    event.preventDefault();
    if (!user?.id) { alert('로그인 후 명대사를 작성할 수 있습니다.'); return; }
    if (!highlightQuote.trim()) { alert('인상 깊은 문장을 입력해주세요.'); return; }

    try {
      const saved = await addHighlight({
        bookId: Number(detailBookId),
        userId: user.id,
        quote: highlightQuote.trim(),
        note: highlightNote.trim(),
        page: highlightPage,
        isSpoiler: highlightSpoiler,
      });
      setHighlights((prev) => [saved, ...prev]);
      setHighlightQuote('');
      setHighlightNote('');
      setHighlightPage('');
      setHighlightSpoiler(false);
      setHighlightModalOpen(false);
      setActiveDetailTab('highlights');
    } catch (err) {
      alert(err.message || '명대사 등록 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteHighlight = async (highlightId) => {
    if (!window.confirm('정말 이 명대사를 삭제하시겠습니까?')) return;

    try {
      await deleteHighlight(highlightId, user?.id);
      setHighlights((prev) => prev.filter((highlight) => highlight.id !== highlightId));
    } catch (err) {
      alert(err.message || '명대사 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <p className="loading">불러오는 중...</p>;
  if (error) return <p className="error">에러: {error}</p>;
  if (!book) return <p className="error">도서를 찾을 수 없습니다.</p>;

  return (
    <main className="book-detail-page">
      <div className="detail-page-inner">
        <button className="back-btn" onClick={() => navigate('/books')}>← 책 둘러보기</button>
        {saveMessage && <div className="save-message">{saveMessage}</div>}

        <section className="book-detail-layout">
          <BookDetailSidePanel
            book={book}
            formData={formData}
            isEditing={isEditing}
            bookStatus={bookStatus}
            sideMenuOpen={sideMenuOpen}
            setSideMenuOpen={setSideMenuOpen}
            statusOptions={statusOptions}
            onStatusChange={handleStatusChange}
            bookshelves={bookshelves}
            currentShelfId={currentShelfId}
            shelfSubMenuOpen={shelfSubMenuOpen}
            setShelfSubMenuOpen={setShelfSubMenuOpen}
            onAssignShelf={handleAssignShelf}
            onRemoveFromShelf={handleRemoveFromShelf}
            onOpenHighlight={() => setHighlightModalOpen(true)}
            onOpenReview={() => setReviewModalOpen(true)}
            aiApiKey={aiApiKey}
            setAiApiKey={setAiApiKey}
            showAiApiKey={showAiApiKey}
            setShowAiApiKey={setShowAiApiKey}
            aiPosters={aiPosters}
            aiGenerating={aiGenerating}
            onAiGenerate={handleAiGenerate}
            onSelectPoster={(poster) => setFormData((prev) => ({ ...prev, poster }))}
            onStartEdit={() => setIsEditing(true)}
            onDelete={handleDelete}
            onSave={handleSave}
            onCancelEdit={handleCancelEdit}
            canManageBook={canManageBook}
            canEditBook={canEditBook}
          />

          <section className="book-main-panel">
            {!isEditing ? (
              <div className="book-info-view">
                <h1>{book.title}</h1>
                <div className="book-sub-info">
                  <span>{book.author || '저자 미상'}</span>
                  <em>—</em>
                  <span>{book.publishedDate || '출판일 미등록'}</span>
                </div>
                <p className="book-description">{book.description || '등록된 설명이 없습니다.'}</p>
                {book.moods?.length > 0 && (
                  <div className="book-mood-tags">
                    {book.moods.map((mood) => <span key={mood} className="book-mood-tag">{mood}</span>)}
                  </div>
                )}
                <dl className="book-info-table">
                  <div><dt>장르</dt><dd>{book.genre || '미등록'}</dd></div>
                  <div><dt>평균 별점</dt><dd>{getAverageRating()} / 5.0</dd></div>
                  <div><dt>리뷰 수</dt><dd>{reviews.length}개</dd></div>
                  <div><dt>좋아요</dt><dd>{book.likes || 0}개</dd></div>
                </dl>
                <div className="reading-status-list">
                  <p><span>▯</span><strong>{book.readingStatus === 'reading' ? 1 : 0}</strong>명이 이 책을 읽는 중입니다</p>
                  <p><span>✓</span><strong>{reviews.length}</strong>명이 리뷰를 남겼습니다</p>
                  <p><span>☆</span><strong>{book.likes || 0}</strong>명이 이 책을 좋아합니다</p>
                </div>
              </div>
            ) : (
              <div className="book-edit-view">
                <h1>도서 정보 수정</h1>
                <div className="form-group">
                  <label>제목 *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>작가</label>
                  <input type="text" name="author" value={formData.author} onChange={handleInputChange} placeholder="작가 이름" />
                </div>
                <div className="form-group">
                  <label>설명</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="5" placeholder="도서 설명" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>등록일</label>
                    <input type="date" name="createdDate" value={formData.createdDate} readOnly />
                  </div>
                  <div className="form-group">
                    <label>출판일</label>
                    <input type="date" name="publishedDate" value={formData.publishedDate} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>장르</label>
                    <input type="text" name="genre" value={formData.genre} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>수정일</label>
                    <input type="date" name="modifiedDate" value={formData.modifiedDate} readOnly />
                  </div>
                </div>
              </div>
            )}

            <section className="review-section">
              <div className="review-tab-row">
                <button
                  type="button"
                  className={activeDetailTab === 'reviews' ? 'active' : ''}
                  onClick={() => setActiveDetailTab('reviews')}
                >
                  리뷰 <span>{reviews.length}</span>
                </button>
                <button
                  type="button"
                  className={activeDetailTab === 'highlights' ? 'active' : ''}
                  onClick={() => setActiveDetailTab('highlights')}
                >
                  명대사 <span>{highlights.length}</span>
                </button>
              </div>

              {activeDetailTab === 'reviews' ? (
                <div className="detail-review-list">
                  {reviews.length > 0 ? reviews.map((review) => {
                    const isMine = user?.id && review.userId === user.id;

                    return (
                      <article className="detail-review-item" key={review.id}>
                        <div className="detail-review-head">
                          <div>
                            <strong>{review.writer || '익명'}</strong>
                            <span>{review.createdAt || '작성일 없음'}</span>
                          </div>
                          <em>{'★'.repeat(review.rating || 0)}{'☆'.repeat(Math.max(0, 5 - (review.rating || 0)))}</em>
                        </div>

                        {editingReviewId === review.id ? (
                          <div>
                            <div className="modal-rating-row" style={{ marginBottom: 8 }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  type="button"
                                  key={star}
                                  className={editRating >= star ? 'selected' : ''}
                                  onClick={() => setEditRating(star)}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows="3" style={{ width: '100%', marginBottom: 8 }} />
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button type="button" className="save-btn" onClick={() => handleUpdateReview(review.id)}>저장</button>
                              <button type="button" className="cancel-btn" onClick={() => setEditingReviewId(null)}>취소</button>
                            </div>
                          </div>
                        ) : (
                          <p>{getReviewText(review) || '내용 없는 리뷰입니다.'}</p>
                        )}

                        {isMine && editingReviewId !== review.id && (
                          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <button
                              type="button"
                              className="edit-btn"
                              onClick={() => {
                                setEditingReviewId(review.id);
                                setEditContent(getReviewText(review));
                                setEditRating(review.rating || 0);
                              }}
                            >
                              수정
                            </button>
                            <button type="button" className="review-delete-btn" onClick={() => handleDeleteReview(review.id)}>삭제</button>
                          </div>
                        )}
                      </article>
                    );
                  }) : (
                    <div className="detail-empty-box">아직 등록된 리뷰가 없습니다.</div>
                  )}
                </div>
              ) : (
                <div className="highlight-list">
                  {highlights.length > 0 ? highlights.map((highlight) => {
                    const isMine = user?.id && highlight.userId === user.id;

                    return (
                      <article className="highlight-item" key={highlight.id}>
                        <blockquote>{highlight.quote}</blockquote>
                        {highlight.note && <p>{highlight.note}</p>}
                        <div>
                          {highlight.page && <span>{highlight.page}쪽</span>}
                          {highlight.isSpoiler && <span>스포일러 포함</span>}
                          <span>{formatHighlightDate(highlight.createdAt)}</span>
                        </div>
                        {isMine && (
                          <button type="button" className="review-delete-btn" style={{ marginTop: 8 }} onClick={() => handleDeleteHighlight(highlight.id)}>삭제</button>
                        )}
                      </article>
                    );
                  }) : (
                    <div className="detail-empty-box">아직 등록된 명대사가 없습니다.</div>
                  )}
                </div>
              )}
            </section>
          </section>
        </section>
      </div>

      <BookDetailModals
        bookTitle={book.title}
        reviewModalOpen={reviewModalOpen}
        reviewRating={reviewRating}
        setReviewRating={setReviewRating}
        reviewContent={reviewContent}
        setReviewContent={setReviewContent}
        selectedReviewTags={selectedReviewTags}
        onToggleReviewTag={(tag) => setSelectedReviewTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])}
        onSubmitReview={handleSubmitReview}
        onCloseReview={() => { setReviewRating(0); setReviewContent(''); setSelectedReviewTags([]); setReviewModalOpen(false); }}
        highlightModalOpen={highlightModalOpen}
        highlightQuote={highlightQuote}
        setHighlightQuote={setHighlightQuote}
        highlightNote={highlightNote}
        setHighlightNote={setHighlightNote}
        highlightPage={highlightPage}
        setHighlightPage={setHighlightPage}
        highlightSpoiler={highlightSpoiler}
        setHighlightSpoiler={setHighlightSpoiler}
        onSubmitHighlight={handleSubmitHighlight}
        onCloseHighlight={() => { setHighlightQuote(''); setHighlightNote(''); setHighlightPage(''); setHighlightSpoiler(false); setHighlightModalOpen(false); }}
      />
    </main>
  );
}

export default BookDetailPage;
