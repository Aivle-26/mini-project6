import { useState } from 'react';
import { getFormattedDateTime } from '../utils/formatDate';

function ReviewItem({ review, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(review.content || '');
  const [editRating, setEditRating] = useState(review.rating || 5);

  const renderStars = (rating) => {
    return '⭐'.repeat(rating || 0);
  };

  const handleSave = () => {
    if (!editContent.trim()) {
      alert('리뷰 내용을 입력하세요.');
      return;
    }

    onUpdate?.(review.id, {
      content: editContent.trim(),
      rating: Number(editRating),
      modifiedAt: getFormattedDateTime(),
    });

    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(review.content || '');
    setEditRating(review.rating || 5);
    setIsEditing(false);
  };

  return (
    <div className="review-item">
      <div className="review-header">
        <div>
          <strong>{review.writer}</strong>

          <div className="review-rating">
            {renderStars(review.rating)} <span>{review.rating || 0}점</span>
          </div>
        </div>

        <span>
          {review.modifiedAt
            ? `수정됨: ${review.modifiedAt}`
            : review.createdAt}
        </span>
      </div>

      {!isEditing ? (
        <p>{review.content}</p>
      ) : (
        <div className="review-edit-area">
          <select
            className="rating-select"
            value={editRating}
            onChange={(e) => setEditRating(e.target.value)}
          >
            <option value="5">⭐⭐⭐⭐⭐ 5점</option>
            <option value="4">⭐⭐⭐⭐ 4점</option>
            <option value="3">⭐⭐⭐ 3점</option>
            <option value="2">⭐⭐ 2점</option>
            <option value="1">⭐ 1점</option>
          </select>

          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
        </div>
      )}

      <div className="review-actions">
        {!isEditing ? (
          <>
            <button
              type="button"
              className="review-edit-btn"
              onClick={() => setIsEditing(true)}
            >
              수정
            </button>

            <button
              type="button"
              className="review-delete-btn"
              onClick={() => onDelete?.(review.id)}
            >
              삭제
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="review-save-btn"
              onClick={handleSave}
            >
              저장
            </button>

            <button
              type="button"
              className="review-cancel-btn"
              onClick={handleCancel}
            >
              취소
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ReviewItem;