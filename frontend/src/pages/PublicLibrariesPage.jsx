import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicLibraryUsers } from '../api/usersApi';
import { useAuth } from '../context/AuthContext';
import '../styles/PublicLibrariesPage.css';

function PublicLibrariesPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    getPublicLibraryUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    if (u.id === user?.id) return false; // 내 서재는 제외
    if (!keyword.trim()) return true;
    const k = keyword.toLowerCase();
    return (
      (u.nickname || '').toLowerCase().includes(k) ||
      (u.username || '').toLowerCase().includes(k)
    );
  });

  return (
    <main className="pub-lib-page">
      <div className="pub-lib-inner">
        <div className="pub-lib-header">
          <div>
            <p className="pub-lib-label">공개 서재 둘러보기</p>
            <h1 className="pub-lib-title">다른 사람의 서재를 둘러보세요</h1>
            <p className="pub-lib-desc">서재를 공개한 유저들의 책 컬렉션을 열람할 수 있습니다.</p>
          </div>
        </div>

        <div className="pub-lib-search-row">
          <form className="pub-lib-search" onSubmit={(e) => e.preventDefault()}>
            <span>⌕</span>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="닉네임 또는 아이디로 검색..."
            />
          </form>
          <span className="pub-lib-count">
            {loading ? '' : `${filtered.length}명`}
          </span>
        </div>

        {loading ? (
          <p className="pub-lib-loading">서재 목록을 불러오는 중...</p>
        ) : filtered.length === 0 ? (
          <div className="pub-lib-empty">
            <p>{keyword ? '검색 결과가 없습니다.' : '공개된 서재가 없습니다.'}</p>
          </div>
        ) : (
          <div className="pub-lib-grid">
            {filtered.map((u) => (
              <Link
                key={u.id}
                to={`/users/${u.username}/library`}
                className="pub-lib-card"
              >
                <div className="pub-lib-avatar">
                  {u.profileImage ? (
                    <img src={u.profileImage} alt={u.nickname} />
                  ) : (
                    <span>{(u.nickname || u.username || '?')[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="pub-lib-card-info">
                  <strong className="pub-lib-nickname">{u.nickname}</strong>
                  <span className="pub-lib-username">@{u.username}</span>
                  {u.bio && <p className="pub-lib-bio">{u.bio}</p>}
                </div>
                <span className="pub-lib-arrow">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default PublicLibrariesPage;
