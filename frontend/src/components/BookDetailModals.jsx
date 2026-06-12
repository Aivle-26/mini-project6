import { REVIEW_TAG_OPTIONS } from '../constants';

export default function BookDetailModals({
  bookTitle,
  reviewModalOpen,
  reviewRating,
  setReviewRating,
  reviewContent,
  setReviewContent,
  selectedReviewTags,
  onToggleReviewTag,
  onSubmitReview,
  onCloseReview,
  highlightModalOpen,
  highlightQuote,
  setHighlightQuote,
  highlightNote,
  setHighlightNote,
  highlightPage,
  setHighlightPage,
  highlightSpoiler,
  setHighlightSpoiler,
  onSubmitHighlight,
  onCloseHighlight,
}) {
  return (
    <>
      {reviewModalOpen && (
        <div className="detail-modal-backdrop">
          <form className="detail-modal" onSubmit={onSubmitReview}>
            <button type="button" className="modal-close-btn" onClick={onCloseReview}>×</button>

            <h2>{bookTitle} 리뷰 작성</h2>

            <div className="modal-rating-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={reviewRating >= star ? 'selected' : ''}
                  onClick={() => setReviewRating(star)}
                >
                  ★
                </button>
              ))}
              <span>{reviewRating > 0 ? `${reviewRating}점` : '별점 없음'}</span>
            </div>

            <textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="이 책을 읽고 어떤 생각이 들었나요?"
              rows="6"
            />

            <div className="modal-tag-section">
              <div className="modal-section-title">
                <strong>이 책을 가장 잘 설명하는 말</strong>
                <span>여러 개 선택 가능</span>
              </div>
              <div className="modal-tag-grid">
                {REVIEW_TAG_OPTIONS.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    className={selectedReviewTags.includes(tag) ? 'selected' : ''}
                    onClick={() => onToggleReviewTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="modal-submit-btn" disabled={!reviewContent.trim()}>
              리뷰 등록
            </button>
          </form>
        </div>
      )}

      {highlightModalOpen && (
        <div className="detail-modal-backdrop">
          <form className="detail-modal" onSubmit={onSubmitHighlight}>
            <button type="button" className="modal-close-btn" onClick={onCloseHighlight}>×</button>

            <h2>인상 깊은 문장 추가</h2>

            <textarea
              value={highlightQuote}
              onChange={(e) => setHighlightQuote(e.target.value)}
              placeholder="책에서 기억하고 싶은 문장을 입력하세요"
              rows="4"
            />

            <input
              type="text"
              value={highlightNote}
              onChange={(e) => setHighlightNote(e.target.value)}
              placeholder="메모를 입력하세요"
            />

            <div className="highlight-option-row">
              <label>
                <input
                  type="checkbox"
                  checked={highlightSpoiler}
                  onChange={(e) => setHighlightSpoiler(e.target.checked)}
                />
                스포일러 포함
              </label>
              <input
                type="number"
                value={highlightPage}
                onChange={(e) => setHighlightPage(e.target.value)}
                placeholder="쪽수"
              />
            </div>

            <button type="submit" className="modal-submit-btn" disabled={!highlightQuote.trim()}>
              문장 등록
            </button>
          </form>
        </div>
      )}
    </>
  );
}
