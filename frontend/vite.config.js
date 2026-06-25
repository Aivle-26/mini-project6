import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // ✅ /api/oauth2 → 백엔드로 prefix 유지 (OAuth2 흐름은 /oauth2/... 경로 그대로 필요)
      '/api/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // ✅ /api/login → 백엔드 OAuth2 콜백 경로
      '/api/login': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // ✅ 일반 API 요청: /api/auth/... → /auth/..., /api/users/... → /users/...
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
