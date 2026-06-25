import { apiFetch } from './apiClient';

const BASE = '/api/analytics';

export const getReadingReport = (userId) =>
  apiFetch(`${BASE}/users/${userId}/reading-report?requesterId=${userId}`, {
    errorMsg: 'AI 독서 리포트를 불러오지 못했습니다.',
  });

export const getAiReadingReport = (userId, apiKey, model = 'gpt-4o-mini') =>
  apiFetch(`${BASE}/users/${userId}/reading-report/ai`, {
    method: 'POST',
    body: { requesterId: userId, apiKey, model },
    errorMsg: 'LLM 인사이트 생성에 실패했습니다.',
  });
