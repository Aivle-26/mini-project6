import { Link } from 'react-router-dom';
import '../styles/PublicHeader.css';

function PublicHeader() {
  return (
    <header className="public-header">
      <Link to="/" className="public-logo" aria-label="책담 홈">
        책담<span>*</span>
      </Link>

      <nav className="public-nav" aria-label="공개 메뉴">
        <Link to="/signup" className="public-nav-link">
          회원가입
        </Link>

        <Link to="/login" className="public-nav-link">
          로그인
        </Link>

        <Link to="/explore" className="public-nav-link">
          매장안내
        </Link>

        <Link to="/explore" className="public-nav-link">
          고객센터
        </Link>
      </nav>
    </header>
  );
}

export default PublicHeader;
