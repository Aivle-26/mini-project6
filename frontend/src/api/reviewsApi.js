import { apiFetch } from './apiClient';

const API_URL = 'http://localhost:8080/reviews';

export const getAllReviews = () =>
  apiFetch(API_URL, { errorMsg: '전체 리뷰를 불러오지 못했습니다.' });

export const getReviewsByBookId = (bookId) =>
  apiFetch(`${API_URL}?bookId=${bookId}`, { errorMsg: '리뷰 목록을 불러오지 못했습니다.' });

export const addReview = (review) =>
  apiFetch(API_URL, { method: 'POST', body: review, errorMsg: '리뷰 등록에 실패했습니다.' });

export const updateReview = (reviewId, review) =>
  apiFetch(`${API_URL}/${reviewId}`, { method: 'PATCH', body: review, errorMsg: '리뷰 수정에 실패했습니다.' });

export const deleteReview = (reviewId) =>
  apiFetch(`${API_URL}/${reviewId}`, { method: 'DELETE', returnJson: false, errorMsg: '리뷰 삭제에 실패했습니다.' });
