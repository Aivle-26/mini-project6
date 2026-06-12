import "./styles/App.css";
import './styles/DarkMode.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { FollowProvider } from './context/FollowContext';
import { ReadingGoalProvider } from './context/ReadingGoalContext';

import PublicHeader from './components/PublicHeader';
import Header from './components/Header';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

import Home from './pages/Home';
import ExplorePage from './pages/ExplorePage';
import LibraryPage from './pages/LibraryPage';
import AddBookPage from './pages/AddBookPage';
import AiCoverGeneratePage from './pages/AiCoverGeneratePage';
import PublicCoverSelectPage from './pages/PublicCoverSelectPage';
import BookDetailPage from './pages/BookDetailPage';

import UserProfilePage from './pages/UserProfilePage';
import ProfileEditPage from './pages/ProfileEditPage';
import TrashPage from './pages/TrashPage';
import ReadingGoalPage from './pages/ReadingGoalPage';
import FindPeoplePage from './pages/FindPeoplePage';
import BookListPage from './pages/BookListPage';
import RandomBooksPage from './pages/RandomBooksPage';
import RecommendPage from './pages/RecommendPage';
import PublicLibrariesPage from './pages/PublicLibrariesPage';
import UserLibraryPage from './pages/UserLibraryPage';

function AppContent() {
  const { isLoggedIn } = useAuth();

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  return (
    <Router>
      {isLoggedIn ? (
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />
      ) : (
        <PublicHeader darkMode={darkMode} setDarkMode={setDarkMode} />
      )}

      <Routes>
        {/* 로그인 전: 랜딩 / 로그인 후: 홈 */}
        <Route path="/" element={isLoggedIn ? <Home /> : <LandingPage />} />

        {/* 로그인 / 회원가입 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* 메인 페이지 */}
        <Route path="/home" element={<Home />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/books" element={<ExplorePage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/goals" element={<ReadingGoalPage />} />

        {/* 도서 등록 / AI 표지 */}
        <Route path="/add-book" element={<AddBookPage />} />
        <Route path="/add-book/ai-cover" element={<AiCoverGeneratePage />} />
        <Route path="/covers/public" element={<PublicCoverSelectPage />} />

        {/* 사용자 / 프로필 */}
        <Route path="/users/:username" element={<UserProfilePage />} />
        <Route path="/profile/edit" element={<ProfileEditPage />} />

        {/* 도서 목록 (검색/정렬/장르필터) */}
        <Route path="/booklist" element={<BookListPage />} />

        {/* 사람 찾기 */}
        <Route path="/people" element={<FindPeoplePage />} />

        {/* 랜덤 / 추천 / 공개서재 */}
        <Route path="/random" element={<RandomBooksPage />} />
        <Route path="/recommend" element={<RecommendPage />} />
        <Route path="/public-libraries" element={<PublicLibrariesPage />} />
        <Route path="/users/:username/library" element={<UserLibraryPage />} />

        {/* 휴지통 */}
        <Route path="/trash" element={<TrashPage />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <FollowProvider>
        <ReadingGoalProvider>
          <AppContent />
        </ReadingGoalProvider>
      </FollowProvider>
    </AuthProvider>
  );
}

export default App;
