import { apiFetch } from './apiClient';

const BASE = 'http://localhost:8080/analytics';

export const getReadingReport = (userId) =>
  apiFetch(`${BASE}/users/${userId}/reading-report?requesterId=${userId}`, {
    errorMsg: 'AI 독서 리포트를 불러오지 못했습니다.',
  });
