import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFormattedDateTime } from '../utils/formatDate';

function ReviewForm({ bookId, onAddReview }) {
  const { user } = useAuth();
  const [writer, setWriter] = useState(user?.nickname || user?.username || '');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();

    const writerValue = writer.trim();
    const contentValue = content.trim();

    if (!writerValue || !contentValue) {
      alert('닉네임과 리뷰를 입력하세요.');
      return;
    }

    const newReview = {
      bookId: String(bookId),
      writer: writerValue,
      content: contentValue,
      rating: Number(rating),
      createdAt: getFormattedDateTime(),
    };

    onAddReview(newReview);

    setWriter('');
    setContent('');
    setRating(5);
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="닉네임"
        value={writer}
        onChange={(e) => setWriter(e.target.value)}
      />

      <select
        className="rating-select"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
      >
        <option value="5">⭐⭐⭐⭐⭐ 5점</option>
        <option value="4">⭐⭐⭐⭐ 4점</option>
        <option value="3">⭐⭐⭐ 3점</option>
        <option value="2">⭐⭐ 2점</option>
        <option value="1">⭐ 1점</option>
      </select>

      <textarea
        placeholder="리뷰를 작성하세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button type="submit">
        리뷰 등록
      </button>
    </form>
  );
}

export default ReviewForm;