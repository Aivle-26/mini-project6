import { apiFetch } from './apiClient';

const API_URL = 'http://localhost:8080/books';

export const getBooks = () =>
  apiFetch(API_URL, { errorMsg: '도서 목록을 불러오지 못했습니다.' });

export const getBookById = (id) =>
  apiFetch(`${API_URL}/${id}`, { errorMsg: '도서를 불러오지 못했습니다.' });

export const addBook = (book) =>
  apiFetch(API_URL, { method: 'POST', body: book, errorMsg: '도서 등록에 실패했습니다.', parseBodyFirst: true });

export const updateBook = (id, book) =>
  apiFetch(`${API_URL}/${id}`, { method: 'PATCH', body: book, errorMsg: '도서 수정에 실패했습니다.' });

export const replaceBook = (id, book) =>
  apiFetch(`${API_URL}/${id}`, { method: 'PUT', body: book, errorMsg: '도서 저장에 실패했습니다.' });

export const moveBookToTrash = (id) =>
  apiFetch(`${API_URL}/${id}`, { method: 'DELETE', returnJson: false, errorMsg: '도서 삭제에 실패했습니다.' });

export const getTrashBooks = () =>
  apiFetch(`${API_URL}/trash`, { errorMsg: '휴지통 목록을 불러오지 못했습니다.' });

export const restoreBook = (id) =>
  apiFetch(`${API_URL}/${id}/restore`, { method: 'PATCH', returnJson: false, errorMsg: '도서 복구에 실패했습니다.' });

export const permanentlyDeleteBook = (id) =>
  apiFetch(`${API_URL}/${id}/permanent`, { method: 'DELETE', returnJson: false, errorMsg: '도서 영구 삭제에 실패했습니다.' });

export const toggleBookLike = (bookId, userId) =>
  apiFetch(`${API_URL}/${bookId}/likes?userId=${userId}`, { method: 'POST', returnJson: false, errorMsg: '좋아요 처리에 실패했습니다.' });

export const getMyBooks = (userId) =>
  apiFetch(`${API_URL}/my?userId=${userId}`, { errorMsg: '내 서재를 불러오지 못했습니다.' });

export const updateBookCover = (id, posterUrl) =>
  apiFetch(`${API_URL}/${id}/cover`, { method: 'PATCH', body: { posterUrl }, errorMsg: '표지 저장에 실패했습니다.' });

export const getRecommendedBooks = (userId) =>
  apiFetch(`${API_URL}/recommend?userId=${userId}`, { errorMsg: '추천 도서를 불러오지 못했습니다.' });

export const getRandomBooks = (count = 20) =>
  apiFetch(`${API_URL}/random?count=${count}`, { errorMsg: '랜덤 도서를 불러오지 못했습니다.' });

export const addToLibrary = (bookId, userId) =>
  apiFetch(`${API_URL}/${bookId}/my?userId=${userId}`, { method: 'POST', errorMsg: '내 서재에 추가하지 못했습니다.' });

export const updateReadingStatus = (bookId, readingStatus) =>
  apiFetch(`${API_URL}/${bookId}/status`, { method: 'PATCH', body: { readingStatus }, errorMsg: '독서 상태 변경에 실패했습니다.' });
