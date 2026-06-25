import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = '/api';

/**
 * 구글 로그인 성공 후 백엔드가 redirect해주는 페이지
 * URL: /oauth-success?userId=123
 *
 * 흐름:
 * 1. URL에서 userId 파라미터 추출
 * 2. /auth/me?userId=123 호출로 사용자 정보 조회
 * 3. AuthContext에 저장 (localStorage 포함)
 * 4. /home으로 이동
 */
function OAuthSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const userId = searchParams.get('userId');

    if (!userId) {
      setError('로그인 정보를 찾을 수 없습니다.');
      return;
    }

    fetch(`${API_BASE}/auth/me?userId=${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error('사용자 정보 조회 실패');
        return res.json();
      })
      .then((user) => {
        login(user);
        navigate('/home', { replace: true });
      })
      .catch((err) => {
        console.error('OAuth 로그인 처리 실패:', err);
        setError('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      });
  }, []);

  if (error) {
    return (
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <p style={{ color: 'var(--danger)', fontSize: '15px' }}>{error}</p>
        <button onClick={() => navigate('/login')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          로그인 페이지로 돌아가기
        </button>
      </main>
    );
  }

  return (
    <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <p style={{ color: 'var(--text-sub)', fontSize: '15px' }}>구글 로그인 처리 중...</p>
    </main>
  );
}

export default OAuthSuccessPage;
