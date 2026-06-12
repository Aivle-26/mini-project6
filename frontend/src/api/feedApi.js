import { apiFetch } from './apiClient';

const BASE = 'http://localhost:8080/feeds';

export const getFollowingFeed = (userId) =>
  apiFetch(`${BASE}/following?userId=${userId}`, { errorMsg: '피드 조회에 실패했습니다.' });

export const toggleFeedLike = (feedId, userId) =>
  apiFetch(`${BASE}/${feedId}/likes?userId=${userId}`, { method: 'POST', returnJson: false, errorMsg: '피드 좋아요 처리에 실패했습니다.' });

export const getFeedComments = (feedId) =>
  apiFetch(`${BASE}/${feedId}/comments`, { errorMsg: '댓글 목록을 불러오지 못했습니다.' });

export const addFeedComment = (feedId, { userId, username, content }) =>
  apiFetch(`${BASE}/${feedId}/comments`, { method: 'POST', body: { feedId, userId, username, content }, errorMsg: '댓글 등록에 실패했습니다.' });
