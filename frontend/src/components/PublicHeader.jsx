import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../styles/PublicHeader.css';

function PublicHeader({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [keyword, setKeyword] = useState('');
  const isLoginPage = location.pathname === '/login';

  const handleSearch = (e) => {
    e.preventDefault();

    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      navigate('/explore');
      return;
    }

    navigate(`/books?keyword=${encodeURIComponent(trimmedKeyword)}`);
    setKeyword('');
  };

  return (
    <header className="public-header">
      <Link to="/" className="public-logo" aria-label="책담 홈">
        책담<span>*</span>
      </Link>

      <form className="public-search" onSubmit={handleSearch}>
        <span aria-hidden="true">⌕</span>
        <input
          type="text"
          placeholder="책, 작가, 서재, 사용자를 검색하세요..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </form>

      <nav className="public-nav" aria-label="공개 메뉴">
        <Link to="/explore" className="public-nav-link">
          둘러보기
        </Link>

        <button
          type="button"
          className="public-theme-btn"
          onClick={() => setDarkMode((prev) => !prev)}
          title={darkMode ? '라이트 모드로 변경' : '다크 모드로 변경'}
        >
          {darkMode ? '☀' : '☾'}
        </button>

        {!isLoginPage && (
          <>
            <Link to="/login" className="public-nav-link">
              로그인
            </Link>

            <Link to="/signup" className="public-join-link">
              회원가입
              <span>→</span>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default PublicHeader;
