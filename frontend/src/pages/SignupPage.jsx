import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { signup } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    username: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.passwordConfirm) {
      setErrorMsg('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      const user = await signup({
        email: form.email,
        username: form.username,
        nickname: form.nickname,
        password: form.password,
      });

      login(user);
      navigate('/home');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell auth-shell-signup">
        <div className="auth-panel auth-panel-wide">
          <div className="auth-header">
            <p className="auth-eyebrow">책담 회원가입</p>
            <h1>나만의 서재 만들기</h1>
            <p>읽고 싶은 책, 읽는 중인 책, 완독한 책을 한곳에서 정리하세요.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="email">이메일</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="auth-field-grid">
              <div className="auth-field">
                <label htmlFor="nickname">닉네임</label>
                <input
                  id="nickname"
                  name="nickname"
                  type="text"
                  value={form.nickname}
                  onChange={handleChange}
                  placeholder="서재 이름"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="username">아이디</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="booklover"
                  required
                />
              </div>
            </div>

            <div className="auth-field-grid">
              <div className="auth-field">
                <label htmlFor="password">비밀번호</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="6자 이상"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="passwordConfirm">비밀번호 확인</label>
                <input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  value={form.passwordConfirm}
                  onChange={handleChange}
                  placeholder="다시 입력"
                  required
                />
              </div>
            </div>

            {errorMsg && <p className="auth-error">{errorMsg}</p>}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? '처리 중...' : '회원가입'}
            </button>
          </form>

          <div className="auth-footer">
            <span>이미 계정이 있나요?</span>
            <Link to="/login">로그인</Link>
          </div>
        </div>

        <aside className="auth-hero auth-hero-signup" aria-label="책담 회원 혜택">
          <div className="auth-hero-copy">
            <p className="auth-hero-kicker">새로운 독서 습관</p>
            <h2>서재를 만들면 취향이 선명해집니다.</h2>
            <p>
              책장, 리뷰, 하이라이트, 독서 목표가 연결되어 다음에 읽을 책을 더 쉽게 고를 수 있습니다.
            </p>
          </div>
          <div className="auth-hero-board">
            <div className="auth-book-card auth-book-card-primary">
              <span>Library</span>
              <strong>첫 책 등록</strong>
              <small>지금 바로 시작</small>
            </div>
            <div className="auth-book-row">
              <span>리뷰 기록</span>
              <strong>감상 보관</strong>
            </div>
            <div className="auth-book-row">
              <span>공개 서재</span>
              <strong>친구와 공유</strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default SignupPage;
