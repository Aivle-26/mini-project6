import { useEffect, useState } from 'react';
import { getMyBooks } from '../api/booksApi';
import '../styles/ReadingGoalPage.css';
import { useReadingGoal } from '../context/ReadingGoalContext';
import { useAuth } from '../context/AuthContext';

function ReadingGoalPage() {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();
  const {
    goals,
    activeGoal,
    activeGoalId,
    setActiveGoalId,
    createGoal,
    updateGoal,
    deleteGoal,
    addBookToGoal,
    removeBookFromGoal,
  } = useReadingGoal();

  const [books, setBooks] = useState([]);
  const [modalMode, setModalMode] = useState(null);
  const [showBookPicker, setShowBookPicker] = useState(false);

  const [goalForm, setGoalForm] = useState({
    name: `${currentYear} Reading Goal`,
    year: currentYear,
    startDate: `${currentYear}-01-01`,
    endDate: `${currentYear}-12-31`,
    goalCount: 24,
    autoAdd: true,
  });

  const selectedGoal = activeGoal;
  const selectedGoalBooks = selectedGoal?.books || [];
  const currentCount = selectedGoalBooks.length;

  const progressPercent = selectedGoal
    ? Math.min(Math.round((currentCount / selectedGoal.goalCount) * 100), 100)
    : 0;

  useEffect(() => {
    if (!user?.id) return;
    getMyBooks(user.id)
      .then(setBooks)
      .catch((error) => console.error('책 목록을 불러오지 못했습니다.', error));
  }, [user]);

  const openCreateModal = () => {
    setGoalForm({
      name: `${currentYear} Reading Goal`,
      year: currentYear,
      startDate: `${currentYear}-01-01`,
      endDate: `${currentYear}-12-31`,
      goalCount: 24,
      autoAdd: true,
    });
    setShowBookPicker(false);
    setModalMode('create');
  };

  const openEditModal = () => {
    if (!selectedGoal) return;
    setGoalForm({
      name: selectedGoal.name,
      year: selectedGoal.year,
      startDate: selectedGoal.startDate || `${selectedGoal.year}-01-01`,
      endDate: selectedGoal.endDate || `${selectedGoal.year}-12-31`,
      goalCount: selectedGoal.goalCount,
      autoAdd: selectedGoal.autoAdd,
    });
    setShowBookPicker(false);
    setModalMode('edit');
  };

  const openManageBooksModal = () => {
    setShowBookPicker(false);
    setModalMode('manage');
  };

  const closeModal = () => {
    setModalMode(null);
    setShowBookPicker(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const stringFields = ['name', 'startDate', 'endDate'];
    setGoalForm((prev) => ({
      ...prev,
      [name]: stringFields.includes(name) ? value : Number(value),
    }));
  };

  const handleCreateGoal = () => {
    if (!goalForm.goalCount || goalForm.goalCount < 1) {
      alert('목표 권수를 1권 이상 입력해주세요.');
      return;
    }
    const year = goalForm.startDate
      ? new Date(goalForm.startDate).getFullYear()
      : goalForm.year;
    createGoal({
      name: goalForm.name || `${currentYear} Reading Goal`,
      year,
      startDate: goalForm.startDate,
      endDate: goalForm.endDate,
      goalCount: goalForm.goalCount,
      autoAdd: goalForm.autoAdd,
    });
    setModalMode(null);
  };

  const handleSaveGoal = () => {
    if (!selectedGoal) return;
    if (!goalForm.goalCount || goalForm.goalCount < 1) {
      alert('목표 권수를 1권 이상 입력해주세요.');
      return;
    }
    if (goalForm.startDate && goalForm.endDate && goalForm.startDate > goalForm.endDate) {
      alert('시작일이 종료일보다 늦을 수 없습니다.');
      return;
    }
    const year = goalForm.startDate
      ? new Date(goalForm.startDate).getFullYear()
      : goalForm.year;
    updateGoal(selectedGoal.id, {
      name: goalForm.name || `${currentYear} Reading Goal`,
      year,
      startDate: goalForm.startDate,
      endDate: goalForm.endDate,
      goalCount: goalForm.goalCount,
      autoAdd: goalForm.autoAdd,
      books: (selectedGoal.books || []).slice(0, goalForm.goalCount),
    });
    setModalMode(null);
  };

  const handleDeleteGoal = () => {
    if (!selectedGoal) return;
    const confirmed = window.confirm('이 독서 목표를 삭제할까요?');
    if (!confirmed) return;
    deleteGoal(selectedGoal.id);
    setActiveGoalId(null);
    setModalMode(null);
  };

  const handleAddBookToGoal = (book) => {
    if (!selectedGoal) return;
    if (selectedGoal.books.length >= selectedGoal.goalCount) {
      alert('이미 목표 권수를 모두 채웠습니다.');
      return;
    }
    const alreadyAdded = selectedGoal.books.some(
      (b) => String(b.id) === String(book.id)
    );
    if (alreadyAdded) {
      alert('이미 목표에 추가된 책입니다.');
      return;
    }
    addBookToGoal(selectedGoal.id, book);
    setShowBookPicker(false);
  };

  const handleRemoveBookFromGoal = (bookId) => {
    if (!selectedGoal) return;
    removeBookFromGoal(selectedGoal.id, bookId);
  };

  const renderGoalSlots = () => {
    if (!selectedGoal) return null;

    return Array.from({ length: selectedGoal.goalCount }, (_, index) => {
      const slotNumber = index + 1;
      const book = selectedGoal.books[index];

      return (
        <div key={slotNumber} className={`goal-slot ${book ? 'has-book' : ''}`}>
          {book ? (
            <img src={book.poster || '/default-book-cover.png'} alt={book.title} />
          ) : (
            <span>{slotNumber}</span>
          )}
        </div>
      );
    });
  };

  return (
    <main className="reading-goal-page">
      <section className="reading-goal-inner">
        {!selectedGoal ? (
          <>
            <div className="reading-goal-top">
              <h1>Goals</h1>

              <button
                type="button"
                className="goal-primary-btn"
                onClick={openCreateModal}
              >
                Create goal
              </button>
            </div>

            {goals.length === 0 ? (
              <section className="goal-empty-box">
                <p>
                  아직 설정한 독서 목표가 없습니다.
                  <br />
                  올해 읽고 싶은 책 수를 정해보세요.
                </p>

                <button
                  type="button"
                  className="goal-outline-btn"
                  onClick={openCreateModal}
                >
                  Create a goal now
                </button>
              </section>
            ) : (
              <section className="goal-list">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    className="goal-list-item"
                    onClick={() => setActiveGoalId(String(goal.id))}
                  >
                    <span className="goal-list-circle">
                      {goal.books.length}
                    </span>

                    <span>
                      <em>Goal</em>
                      <strong>{goal.name}</strong>
                    </span>
                  </button>
                ))}
              </section>
            )}
          </>
        ) : (
          <>
            <div className="goal-detail-header">
              <div className="goal-detail-breadcrumb">
                <button type="button" onClick={() => setActiveGoalId(null)}>
                  Goals
                </button>
                <span>/</span>
                <p>{selectedGoal.name}</p>
              </div>

              <button
                type="button"
                className="goal-edit-btn"
                onClick={openEditModal}
              >
                Edit
              </button>
            </div>

            <section className="goal-detail-card">
              <div className="goal-detail-main">
                <div
                  className="goal-progress-circle"
                  style={{
                    background: `conic-gradient(
                      var(--text-main) ${progressPercent}%,
                      var(--line-main) ${progressPercent}%
                    )`,
                  }}
                >
                  <div>
                    <strong>{currentCount}</strong>
                    <span>of {selectedGoal.goalCount} books</span>
                  </div>
                </div>

                <div className="goal-detail-title">
                  <p>{selectedGoal.year}</p>
                  <h1>{selectedGoal.name}</h1>
                </div>
              </div>

              <div className="goal-owner">
                <div className="goal-owner-avatar">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.nickname} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    user?.nickname?.charAt(0).toUpperCase() || 'Y'
                  )}
                </div>

                <div>
                  <strong>{user?.nickname || 'user'}</strong>
                  <span>@{user?.username || 'user'}</span>
                </div>
              </div>

              <div className="goal-slot-grid">{renderGoalSlots()}</div>

              <button
                type="button"
                className="goal-manage-btn"
                onClick={openManageBooksModal}
              >
                Manage books
              </button>
            </section>
          </>
        )}
      </section>

      {modalMode && (
        <div className="goal-modal-backdrop">
          <section className="goal-modal">
            <button
              type="button"
              className="goal-modal-close"
              onClick={closeModal}
            >
              ×
            </button>

            {modalMode === 'create' && (
              <>
                <h2>New reading goal</h2>

                <div className="goal-create-layout">
                  <div className="goal-create-circle">
                    <input
                      type="number"
                      min="1"
                      name="goalCount"
                      value={goalForm.goalCount}
                      onChange={handleChange}
                    />

                    <span>
                      Books in
                      <br />
                      {goalForm.year}
                    </span>
                  </div>

                  <div className="goal-create-bottom">
                    <button type="button" className="goal-text-btn">
                      Advanced setup
                    </button>

                    <button
                      type="button"
                      className="goal-primary-btn"
                      onClick={handleCreateGoal}
                    >
                      Create goal
                    </button>
                  </div>
                </div>
              </>
            )}

            {modalMode === 'edit' && (
              <>
                <h2>Edit goal</h2>

                <div className="goal-edit-form">
                  <label>
                    <span>Name</span>
                    <input
                      type="text"
                      name="name"
                      value={goalForm.name}
                      onChange={handleChange}
                    />
                  </label>

                  <div className="goal-period-row">
                    <label>
                      <span>Start</span>
                      <input
                        type="date"
                        name="startDate"
                        value={goalForm.startDate}
                        onChange={handleChange}
                      />
                    </label>

                    <label>
                      <span>End</span>
                      <input
                        type="date"
                        name="endDate"
                        value={goalForm.endDate}
                        onChange={handleChange}
                      />
                    </label>
                  </div>

                  <label>
                    <span>Number of books to read</span>
                    <input
                      type="number"
                      min="1"
                      name="goalCount"
                      value={goalForm.goalCount}
                      onChange={handleChange}
                    />
                  </label>

                  <div className="goal-toggle-row">
                    <div>
                      <strong>Automatically add books</strong>
                      <p>
                        읽은 책을 이 목표에 자동으로 포함하는 임시 설정입니다.
                      </p>
                    </div>

                    <button
                      type="button"
                      className={`goal-toggle ${
                        goalForm.autoAdd ? 'is-on' : ''
                      }`}
                      onClick={() =>
                        setGoalForm((prev) => ({
                          ...prev,
                          autoAdd: !prev.autoAdd,
                        }))
                      }
                    >
                      <span />
                    </button>
                  </div>

                  <div className="goal-modal-actions">
                    <button
                      type="button"
                      className="goal-delete-btn"
                      onClick={handleDeleteGoal}
                    >
                      Delete
                    </button>

                    <button
                      type="button"
                      className="goal-primary-btn"
                      onClick={handleSaveGoal}
                    >
                      Save changes
                    </button>
                  </div>
                </div>
              </>
            )}

            {modalMode === 'manage' && selectedGoal && (
              <>
                <div className="goal-manage-header">
                  <div>
                    <h2>Manage books</h2>
                    <p>{selectedGoal.name}</p>
                  </div>

                  <button
                    type="button"
                    className="goal-primary-btn"
                    onClick={() => setShowBookPicker((prev) => !prev)}
                  >
                    Add book
                  </button>
                </div>

                <div className="goal-managed-books">
                  {selectedGoal.books.length === 0 ? (
                    <div className="goal-no-books">No books yet...</div>
                  ) : (
                    selectedGoal.books.map((book, index) => (
                      <div key={book.id} className="goal-managed-book">
                        <span>{index + 1}</span>

                        <img
                          src={book.poster || '/default-book-cover.png'}
                          alt={book.title}
                        />

                        <div>
                          <strong>{book.title}</strong>
                          <p>{book.author}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveBookFromGoal(book.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {showBookPicker && (
                  <div className="goal-book-picker">
                    <h3>내 서재에서 책 선택</h3>

                    {books.length === 0 ? (
                      <p className="goal-picker-empty">
                        아직 등록된 책이 없습니다.
                      </p>
                    ) : (
                      <div className="goal-book-picker-list">
                        {books.map((book) => (
                          <button
                            key={book.id}
                            type="button"
                            className="goal-book-picker-item"
                            onClick={() => handleAddBookToGoal(book)}
                          >
                            <img
                              src={book.poster || '/default-book-cover.png'}
                              alt={book.title}
                            />

                            <span>
                              <strong>{book.title}</strong>
                              <em>{book.author}</em>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

export default ReadingGoalPage;