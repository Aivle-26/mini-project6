import { apiFetch } from './apiClient';

const API_URL = 'http://localhost:8080/highlights';

export const getHighlightsByBookId = (bookId) =>
  apiFetch(`${API_URL}?bookId=${bookId}`, { errorMsg: '하이라이트 목록을 불러오지 못했습니다.' });

export const addHighlight = (highlight) =>
  apiFetch(API_URL, { method: 'POST', body: highlight, errorMsg: '하이라이트 등록에 실패했습니다.' });

export const deleteHighlight = (id) =>
  apiFetch(`${API_URL}/${id}`, { method: 'DELETE', returnJson: false, errorMsg: '하이라이트 삭제에 실패했습니다.' });
