import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookForm from '../components/BookForm';
import { addBook } from '../api/booksApi';
import { useAuth } from '../context/AuthContext';
import '../styles/AddBookPage.css';

function AddBookPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleAddBook = async (newBook) => {
    try {
      await addBook({ ...newBook, userId: user?.id });

      setSuccessMessage('도서가 등록되었습니다.');

      setTimeout(() => {
        navigate('/books');
      }, 1500);
    } catch (err) {
      console.error('도서 등록 실패:', err);
      setErrorMessage(err.message);
    }
  };

  return (
    <main className="add-book-page">
      <section className="add-book-inner">
        <div className="add-book-header">
          <h1>도서 등록</h1>
          <span>
            책 정보와 표지를 입력하면 내 서재에 새로운 도서가 등록됩니다.
          </span>
        </div>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}

        <BookForm onAddBook={handleAddBook} />
      </section>
    </main>
  );
}

export default AddBookPage;