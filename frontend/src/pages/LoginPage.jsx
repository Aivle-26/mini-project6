import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { login as loginApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await loginApi({ email: form.email, password: form.password });
      login(user);
      navigate('/home');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/oauth2/authorization/google';
  };

  return (
    <main className="login-page">
      <section className="login-form-panel" aria-label="로그인">
        <div className="login-shell">
          <button type="button" className="login-google-button" onClick={handleGoogleLogin}>
            <svg width="20" height="20" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
            Google로 계속하기
          </button>

          <div className="login-divider">
            <span>또는</span>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <div className="login-label-row">
                <label htmlFor="email">이메일 주소</label>
              </div>
              <div className="login-input-wrap login-input-plain">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="아이디 또는 이메일을 입력하세요"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <div className="login-label-row">
                <label htmlFor="password">비밀번호</label>
              </div>
              <div className="login-input-wrap">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="비밀번호를 입력하세요"
                  required
                />
              </div>
            </div>

            {errorMsg && <p className="auth-error">{errorMsg}</p>}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? '로그인 중...' : '계속'}
              <span aria-hidden="true">›</span>
            </button>
          </form>

          <div className="login-footer">
            <span>책담이 처음이신가요?</span>
            <Link to="/signup">회원가입하기 →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
