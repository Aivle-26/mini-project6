import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

function Header({ darkMode, setDarkMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    setProfileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const avatarText = user?.nickname?.charAt(0).toUpperCase() ?? '?';
  const avatarImage = user?.profileImage || null;

  return (
    <header className="site-header">
      <Link to="/" className="site-logo" aria-label="책담 홈">
        책담<span>*</span>
      </Link>

      <nav className="site-nav" aria-label="주요 메뉴">
        <Link
          to="/"
          className={`site-nav-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          홈
        </Link>

        <Link
          to="/explore"
          className={`site-nav-link ${
            location.pathname === '/explore' || location.pathname.startsWith('/books')
              ? 'active'
              : ''
          }`}
        >
          둘러보기
        </Link>

        <Link
          to="/library"
          className={`site-nav-link ${
            location.pathname.startsWith('/library') ? 'active' : ''
          }`}
        >
          내 서재
        </Link>

        <Link
          to="/analytics"
          className={`site-nav-link ${
            location.pathname.startsWith('/analytics') ? 'active' : ''
          }`}
        >
          AI 리포트
        </Link>

        <div className="profile-menu-wrap">
          <button
            type="button"
            className="profile-avatar-btn"
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            title="프로필 메뉴"
            style={avatarImage ? { padding: 0, overflow: 'hidden' } : {}}
          >
            {avatarImage ? (
              <img
                src={avatarImage}
                alt={avatarText}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              avatarText
            )}
          </button>

          {profileMenuOpen && (
            <div className="profile-dropdown">
              {user && (
                <div className="profile-dropdown-user">
                  <strong>{user.nickname}</strong>
                  <span>{user.email}</span>
                </div>
              )}

              <div className="profile-dropdown-line" />

              <Link
                to={user ? `/users/${user.username}` : '/login'}
                className="profile-dropdown-item"
              >
                <span>◉</span>
                프로필 보기
              </Link>

              <Link to="/trash" className="profile-dropdown-item">
                <span>×</span>
                휴지통
              </Link>

              <Link to="/goals" className="profile-dropdown-item">
                <span>○</span>
                독서 목표
              </Link>

              <Link to="/analytics" className="profile-dropdown-item">
                <span>AI</span>
                독서 리포트
              </Link>

              <div className="profile-dropdown-line" />

              <button
                type="button"
                className="profile-dropdown-item"
                onClick={() => setDarkMode((prev) => !prev)}
              >
                <span>{darkMode ? '☀' : '☾'}</span>
                {darkMode ? '라이트 모드' : '다크 모드'}
              </button>

              <Link to="/profile/edit" className="profile-dropdown-item">
                <span>⚙</span>
                설정
              </Link>

              <div className="profile-dropdown-line" />

              <button
                type="button"
                className="profile-dropdown-item profile-dropdown-logout"
                onClick={handleLogout}
              >
                <span>⇱</span>
                로그아웃
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
