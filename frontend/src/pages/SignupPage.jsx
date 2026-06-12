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
      <section className="auth-card auth-card-wide">
        <div className="auth-header">
          <p className="auth-eyebrow">Create account</p>
          <h1>회원가입</h1>
          <p>나만의 서재를 만들고 책, 기록, 취향을 차곡차곡 쌓아보세요.</p>
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

          <div className="auth-field">
            <label htmlFor="nickname">닉네임</label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              value={form.nickname}
              onChange={handleChange}
              placeholder="표시될 이름을 입력하세요"
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
              placeholder="예: yeonu (영문/숫자, 4~20자)"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="6자 이상 입력하세요"
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
              placeholder="비밀번호를 한 번 더 입력하세요"
              required
            />
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
      </section>
    </main>
  );
}

export default SignupPage;
