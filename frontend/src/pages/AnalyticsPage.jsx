import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAiReadingReport, getReadingReport } from '../api/analyticsApi';
import '../styles/AnalyticsPage.css';

const emptyReport = {
  scores: [],
  genreDistribution: [],
  moodDistribution: [],
  statusDistribution: [],
  insights: [],
  warnings: [],
};

function pct(value) {
  return `${Math.max(0, Math.min(100, Math.round(value || 0)))}%`;
}

function MetricCard({ label, value, note }) {
  return (
    <div className="analytics-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </div>
  );
}

function ScoreBar({ score }) {
  return (
    <div className="analytics-score">
      <div className="analytics-score-head">
        <strong>{score.label}</strong>
        <span>{score.value}</span>
      </div>
      <div className="analytics-score-track">
        <div style={{ width: pct(score.value) }} />
      </div>
      <p>{score.description}</p>
    </div>
  );
}

function DistributionList({ title, items, emptyText }) {
  return (
    <section className="analytics-panel">
      <h2>{title}</h2>
      {items.length === 0 ? (
        <p className="analytics-empty-text">{emptyText}</p>
      ) : (
        <div className="analytics-distribution">
          {items.map((item) => (
            <div className="analytics-dist-row" key={item.label}>
              <div className="analytics-dist-top">
                <span>{item.label}</span>
                <strong>{item.count}개 · {item.percentage}%</strong>
              </div>
              <div className="analytics-dist-track">
                <div style={{ width: pct(item.percentage) }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function AnalyticsPage() {
  const { user } = useAuth();
  const [report, setReport] = useState(emptyReport);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openaiApiKey') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    getReadingReport(user.id)
      .then((data) => setReport({ ...emptyReport, ...data }))
      .catch((err) => setError(err.message || 'AI 독서 리포트를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleApiKeyChange = (value) => {
    setApiKey(value);
    localStorage.setItem('openaiApiKey', value);
  };

  const handleAiEnhance = async () => {
    if (!user?.id) return;
    if (!apiKey.trim()) {
      setAiMessage('OpenAI API 키를 입력해주세요.');
      return;
    }

    setAiLoading(true);
    setAiMessage('');

    try {
      const data = await getAiReadingReport(user.id, apiKey.trim());
      setReport({ ...emptyReport, ...data });
      setAiMessage('LLM 인사이트가 적용되었습니다.');
    } catch (err) {
      setAiMessage(err.message || 'LLM 인사이트 생성에 실패했습니다. 기본 리포트를 유지합니다.');
    } finally {
      setAiLoading(false);
    }
  };

  const radarPoints = useMemo(() => {
    if (!report.scores.length) return '';
    const cx = 50;
    const cy = 50;
    const radius = 38;
    return report.scores
      .map((score, index) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * index) / report.scores.length;
        const distance = radius * (score.value / 100);
        return `${cx + Math.cos(angle) * distance},${cy + Math.sin(angle) * distance}`;
      })
      .join(' ');
  }, [report.scores]);

  if (!user) {
    return (
      <main className="analytics-page">
        <div className="analytics-inner">
          <div className="analytics-gate">
            <p>AI 독서 리포트는 로그인 후 이용할 수 있습니다.</p>
            <Link to="/login">로그인하기</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="analytics-page">
      <div className="analytics-inner">
        <header className="analytics-hero">
          <p className="analytics-label">AI Reading Report</p>
          <h1>내 서재가 말해주는 독서 성향</h1>
          <p>
            책, 리뷰, 별점, 하이라이트를 분석해 나만의 독서 타입과 취향 점수를 보여줍니다.
          </p>
        </header>

        {loading && <p className="analytics-state">독서 데이터를 분석하는 중입니다...</p>}
        {error && <p className="analytics-state analytics-error">{error}</p>}

        {!loading && !error && (
          <>
            <section className="analytics-ai-box">
              <div>
                <strong>LLM 인사이트 강화</strong>
                <p>OpenAI API 키를 입력하면 기존 분석 결과를 바탕으로 더 자연스러운 독서 타입과 인사이트를 생성합니다.</p>
              </div>
              <div className="analytics-ai-controls">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="sk-..."
                />
                <button type="button" onClick={() => setShowApiKey((prev) => !prev)}>
                  {showApiKey ? '숨기기' : '보기'}
                </button>
                <button type="button" onClick={handleAiEnhance} disabled={aiLoading}>
                  {aiLoading ? '생성 중...' : 'LLM으로 분석 강화'}
                </button>
              </div>
              {aiMessage && <p className="analytics-ai-message">{aiMessage}</p>}
            </section>

            <section className="analytics-summary">
              <div className="analytics-type-card">
                <span>{report.analysisStatus === 'AI_ENHANCED' ? 'LLM Enhanced Type' : 'Reader Type'}</span>
                <h2>{report.readerType || '분석 대기 중'}</h2>
                <p>{report.readerTypeDescription || '서재에 책을 추가하면 독서 성향이 계산됩니다.'}</p>
                <div className="analytics-quality">
                  <strong>데이터 신뢰도</strong>
                  <div>
                    <span style={{ width: pct(report.dataQuality) }} />
                  </div>
                  <em>{report.dataQuality || 0}%</em>
                </div>
              </div>

              <div className="analytics-radar-card">
                <svg viewBox="0 0 100 100" role="img" aria-label="독서 성향 레이더 차트">
                  <polygon points="50,12 82,31 82,69 50,88 18,69 18,31" className="radar-grid" />
                  <polygon points="50,22 74,36 74,64 50,78 26,64 26,36" className="radar-grid radar-grid-soft" />
                  <line x1="50" y1="50" x2="50" y2="12" />
                  <line x1="50" y1="50" x2="82" y2="31" />
                  <line x1="50" y1="50" x2="82" y2="69" />
                  <line x1="50" y1="50" x2="50" y2="88" />
                  <line x1="50" y1="50" x2="18" y2="69" />
                  <line x1="50" y1="50" x2="18" y2="31" />
                  {radarPoints && <polygon points={radarPoints} className="radar-shape" />}
                </svg>
              </div>
            </section>

            <p className="analytics-summary-text">{report.summary}</p>

            {report.warnings.length > 0 && (
              <section className="analytics-warnings">
                <strong>분석 정확도 안내</strong>
                <div>
                  {report.warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              </section>
            )}

            <section className="analytics-metrics">
              <MetricCard label="서재 책" value={`${report.totalBooks || 0}권`} note="삭제되지 않은 내 책 기준" />
              <MetricCard label="완독" value={`${report.finishedBooks || 0}권`} note={`${report.completionRate || 0}% 완독률`} />
              <MetricCard label="평균 별점" value={report.averageRating ? `${report.averageRating}점` : '-'} note="작성한 리뷰 기준" />
              <MetricCard label="기록" value={`${(report.reviewCount || 0) + (report.highlightCount || 0)}개`} note="리뷰 + 하이라이트" />
            </section>

            <section className="analytics-scores">
              {report.scores.map((score) => (
                <ScoreBar score={score} key={score.key} />
              ))}
            </section>

            <section className="analytics-grid">
              <DistributionList
                title="장르 분포"
                items={report.genreDistribution}
                emptyText="아직 장르 데이터가 부족합니다."
              />
              <DistributionList
                title="분위기 분포"
                items={report.moodDistribution}
                emptyText="책에 분위기 태그를 추가하면 더 풍부하게 분석됩니다."
              />
              <DistributionList
                title="독서 상태"
                items={report.statusDistribution}
                emptyText="독서 상태를 설정하면 완독률을 계산할 수 있습니다."
              />
              <section className="analytics-panel">
                <h2>{report.analysisStatus === 'AI_ENHANCED' ? 'LLM 인사이트' : 'AI 인사이트'}</h2>
                <div className="analytics-insights">
                  {report.insights.map((insight) => (
                    <p key={insight}>{insight}</p>
                  ))}
                </div>
              </section>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default AnalyticsPage;
