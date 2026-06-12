import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers } from '../api/usersApi';
import { useAuth } from '../context/AuthContext';
import { useFollow } from '../context/FollowContext';

function FindPeoplePage() {
  const { user } = useAuth();
  const { isFollowing, toggleFollow } = useFollow();

  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    if (!keyword.trim()) return true;
    const k = keyword.toLowerCase();
    return (
      (u.nickname || '').toLowerCase().includes(k) ||
      (u.username || '').toLowerCase().includes(k)
    );
  });

  const others = filtered.filter((u) => u.id !== user?.id);

  return (
    <main style={{ minHeight: 'calc(100vh - 76px)', padding: '40px 24px 100px', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14 }}>← 홈으로</Link>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>사람 찾기</h1>
        </div>

        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="닉네임 또는 아이디로 검색"
          style={{
            width: '100%',
            padding: '12px 16px',
            marginBottom: 24,
            border: '1px solid var(--line-main)',
            background: 'var(--bg-soft)',
            color: 'var(--text-main)',
            fontSize: 15,
            boxSizing: 'border-box',
          }}
        />

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>불러오는 중...</p>
        ) : others.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>검색 결과가 없습니다.</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {others.map((u) => {
              const following = isFollowing(u.username);
              const initial = (u.nickname || u.username || '?')[0].toUpperCase();
              return (
                <li
                  key={u.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 0',
                    borderBottom: '1px solid var(--line-main)',
                  }}
                >
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'var(--bg-soft)',
                    border: '1px solid var(--line-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 18,
                    flexShrink: 0,
                  }}>
                    {u.profileImage
                      ? <img src={u.profileImage} alt={u.nickname} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      : initial}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 15 }}>{u.nickname || u.username}</p>
                    <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>@{u.username}</p>
                    {u.bio && <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>{u.bio}</p>}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFollow(u.username, u.id)}
                    style={{
                      padding: '8px 18px',
                      border: '1px solid var(--line-main)',
                      background: following ? 'var(--text-main)' : 'transparent',
                      color: following ? 'var(--bg-main)' : 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    {following ? '팔로잉' : '팔로우'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}

export default FindPeoplePage;
