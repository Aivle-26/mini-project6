import { useNavigate } from 'react-router-dom';
import '../styles/PublicCoverSelectPage.css';

const makeCoverSvg = (title, author, bg, text) => {
  const svg = `
    <svg width="600" height="900" viewBox="0 0 600 900" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="900" fill="${bg}"/>
      <rect x="48" y="48" width="504" height="804" fill="none" stroke="${text}" stroke-width="3"/>
      <line x1="150" y1="310" x2="450" y2="310" stroke="${text}" stroke-width="2"/>
      <text x="300" y="430" text-anchor="middle" font-family="Georgia, serif" font-size="64" fill="${text}" font-weight="700">${title}</text>
      <text x="300" y="500" text-anchor="middle" font-family="Georgia, serif" font-size="26" fill="${text}">${author}</text>
      <line x1="150" y1="590" x2="450" y2="590" stroke="${text}" stroke-width="2"/>
      <text x="300" y="710" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="${text}">책담</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const publicCovers = [
  {
    id: 1,
    title: '고요한 밤',
    creator: '민서',
    image: makeCoverSvg('MOON', 'quiet night', '#f3efe7', '#151515'),
  },
  {
    id: 2,
    title: '푸른 정원',
    creator: '하준',
    image: makeCoverSvg('GARDEN', 'blue mood', '#dfe8e4', '#10231d'),
  },
  {
    id: 3,
    title: '검은 파도',
    creator: '서연',
    image: makeCoverSvg('WAVE', 'dark sea', '#101010', '#f4f0e8'),
  },
  {
    id: 4,
    title: '오래된 편지',
    creator: '유진',
    image: makeCoverSvg('LETTER', 'old memory', '#eadcc8', '#1d1712'),
  },
  {
    id: 5,
    title: '작은 숲',
    creator: '도윤',
    image: makeCoverSvg('FOREST', 'small woods', '#edf1df', '#243018'),
  },
  {
    id: 6,
    title: '붉은 계절',
    creator: '지우',
    image: makeCoverSvg('SEASON', 'red days', '#ead5d0', '#321412'),
  },
];

function PublicCoverSelectPage() {
  const navigate = useNavigate();

  const selectCover = (coverImage) => {
    sessionStorage.setItem('selectedPoster', coverImage);

    const savedDraft = sessionStorage.getItem('bookDraft');

    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        sessionStorage.setItem(
          'bookDraft',
          JSON.stringify({
            ...parsedDraft,
            poster: coverImage,
          })
        );
      } catch (err) {
        console.error('공유 표지 저장 실패:', err);
      }
    }

    navigate('/add-book');
  };

  return (
    <main className="public-cover-page">
      <section className="public-cover-inner">
        <div className="public-cover-header">
          <button type="button" onClick={() => navigate('/add-book')}>
            ← 도서 등록으로 돌아가기
          </button>

          <h1>표지 템플릿</h1>

          <span>
            미리 만들어진 표지 디자인을 선택해 내 책 표지로 사용할 수 있습니다.
          </span>
        </div>

        <section className="public-cover-grid">
          {publicCovers.map((cover) => (
            <button
              type="button"
              className="public-cover-card"
              key={cover.id}
              onClick={() => selectCover(cover.image)}
            >
              <img src={cover.image} alt={cover.title} />

              <div>
                <h3>{cover.title}</h3>
                <p>by {cover.creator}</p>
              </div>
            </button>
          ))}
        </section>
      </section>
    </main>
  );
}

export default PublicCoverSelectPage;