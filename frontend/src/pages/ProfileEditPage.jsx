import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, deleteUser } from '../api/usersApi';
import '../styles/ProfileEditPage.css';

function ProfileEditPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user, login, logout } = useAuth();

  const [nickname, setNickname] = useState(user?.nickname || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      setErrorMsg('이미지 크기는 500KB 이하만 사용할 수 있습니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setProfileImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmed = window.confirm(
      '정말 탈퇴하시겠습니까?\n계정 정보가 영구적으로 삭제되며 복구할 수 없습니다.'
    );
    if (!confirmed) return;
    setDeleteLoading(true);
    try {
      await deleteUser(user.id);
      logout();
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const updated = await updateUserProfile(user.id, { nickname, username, bio, profileImage });
      login(updated);
      setSuccessMessage('프로필 정보가 저장되었습니다.');
      setTimeout(() => setSuccessMessage(''), 1800);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="profile-edit-page">
      <section className="profile-edit-inner">
        <div className="profile-edit-header">
          <button
            type="button"
            onClick={() => navigate(`/users/${user?.username || ''}`)}
          >
            ← 프로필로 돌아가기
          </button>

          <p>설정</p>
          <h1>프로필 정보를 수정하세요</h1>
          <span>
            닉네임, 아이디, 소개글과 프로필 이미지를 수정할 수 있습니다.
          </span>
        </div>

        {successMessage && (
          <div className="profile-success-message">
            {successMessage}
          </div>
        )}

        {errorMsg && (
          <div className="profile-error-message" style={{ marginBottom: '16px', color: '#c53030', fontSize: '14px' }}>
            {errorMsg}
          </div>
        )}

        <form className="profile-edit-form" onSubmit={handleSave}>
          <section className="profile-image-section">
            <div className="profile-image-preview">
              {profileImage ? (
                <img src={profileImage} alt="프로필 미리보기" />
              ) : (
                <span>{nickname?.slice(0, 1) || '?'}</span>
              )}
            </div>

            <div className="profile-image-info">
              <label>프로필 이미지</label>
              <p>
                직접 이미지를 첨부해 프로필 사진으로 사용할 수 있습니다.
              </p>

              <div className="profile-image-actions">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  이미지 선택
                </button>

                <button
                  type="button"
                  onClick={() => setProfileImage('')}
                >
                  기본 이미지로 변경
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </section>

          <div className="profile-form-group">
            <label>닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
            />
          </div>

          <div className="profile-form-group">
            <label>아이디</label>
            <div className="username-input-wrap">
              <span>@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
              />
            </div>
          </div>

          <div className="profile-form-group">
            <label>소개글</label>
            <textarea
              rows="5"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="나의 독서 취향이나 소개글을 입력하세요"
            />
          </div>

          <section className="account-section">
            <h2>계정 정보</h2>

            <div className="profile-form-group">
              <label>이메일</label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
              />
            </div>

            <p>
              이메일과 비밀번호 변경은 추후 지원됩니다.
            </p>
          </section>

          <button type="submit" className="profile-save-btn" disabled={loading}>
            {loading ? '저장 중...' : '수정사항 저장'}
          </button>
        </form>

        <section className="account-danger-section">
          <h2>계정 삭제</h2>
          <p>탈퇴하면 계정 정보가 영구적으로 삭제되며 복구할 수 없습니다.</p>
          <button
            type="button"
            className="account-delete-btn"
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
          >
            {deleteLoading ? '처리 중...' : '회원 탈퇴'}
          </button>
        </section>
      </section>
    </main>
  );
}

export default ProfileEditPage;
