import ReviewItem from './ReviewItem';

function ReviewList({ reviews = [], onDelete, onUpdate }) {
  if (reviews.length === 0) {
    return (
      <p className="empty-review">
        아직 리뷰가 없습니다.
      </p>
    );
  }

  return (
    <div className="review-list">
      {reviews.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}

export default ReviewList;