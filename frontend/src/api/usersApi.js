import { apiFetch } from './apiClient';

const BASE = 'http://localhost:8080/users';

export const getUserProfile = (username) =>
  apiFetch(`${BASE}/${username}`, { errorMsg: '사용자를 찾을 수 없습니다.' });

export const updateUserProfile = (id, data) =>
  apiFetch(`${BASE}/${id}`, { method: 'PUT', body: data, errorMsg: '프로필 저장에 실패했습니다.', parseBodyFirst: true });

export const getAllUsers = () =>
  apiFetch(BASE, { errorMsg: '사용자 목록 조회에 실패했습니다.' });

export const getPublicLibraryUsers = () =>
  apiFetch(`${BASE}/public`, { errorMsg: '공개 서재 목록 조회에 실패했습니다.' });

export const updateLibraryVisibility = (userId, isPublic) =>
  apiFetch(`${BASE}/${userId}/library-visibility`, { method: 'PATCH', body: { libraryPublic: isPublic }, errorMsg: '서재 공개 설정 변경에 실패했습니다.' });

export const deleteUser = (userId) =>
  apiFetch(`${BASE}/${userId}`, { method: 'DELETE', returnJson: false, errorMsg: '회원 탈퇴에 실패했습니다.' });

export async function getUserBooks(userId) {
  const res = await fetch(`http://localhost:8080/books/user/${userId}`);
  if (!res.ok) {
    if (res.status === 400) throw new Error('비공개 서재입니다.');
    throw new Error('서재를 불러오지 못했습니다.');
  }
  return res.json();
}
