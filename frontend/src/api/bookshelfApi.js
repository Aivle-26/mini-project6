import { apiFetch } from './apiClient';

const BASE = '/api/bookshelves';
const BOOKS_BASE = '/api/books';

const requesterQuery = (requesterId) =>
  requesterId ? `?requesterId=${requesterId}` : '';

export const getMyBookshelves = (userId) =>
  apiFetch(`${BASE}?userId=${userId}`, { errorMsg: '책장 목록을 불러오지 못했습니다.' });

export const createBookshelf = (userId, name) =>
  apiFetch(BASE, { method: 'POST', body: { userId, name }, errorMsg: '책장 생성에 실패했습니다.' });

export const deleteBookshelf = (id) =>
  apiFetch(`${BASE}/${id}`, { method: 'DELETE', returnJson: false, errorMsg: '책장 삭제에 실패했습니다.' });

export const assignBookToShelf = (bookId, bookshelfId, requesterId) =>
  apiFetch(`${BOOKS_BASE}/${bookId}/shelf${requesterQuery(requesterId)}`, {
    method: 'PATCH',
    body: { bookshelfId },
    errorMsg: '책장 배정에 실패했습니다.',
  });
