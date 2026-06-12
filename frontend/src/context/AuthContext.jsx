import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'loginUser';
const API_BASE = 'http://localhost:8080';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 앱 마운트 시 localStorage 유저를 서버에서 검증 (DB 리셋 감지)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    let parsed;
    try { parsed = JSON.parse(stored); } catch { logout(); return; }

    fetch(`${API_BASE}/auth/me?userId=${parsed.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) {
          logout();
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          setUser(data);
        }
      })
      .catch(() => {
        // 서버 오프라인 시 localStorage 그대로 유지
      });
  }, []);

  function login(userData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
