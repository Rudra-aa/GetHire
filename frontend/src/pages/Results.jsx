import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  RadialBarChart, RadialBar,
} from 'recharts'
import { getFinalScore, generateReport, getReportDownloadUrl } from '../services/api'

export default function Results() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { sessionId, candidateName, skills = [] } = location.state || {}

  const [loading, setLoading]           = useState(true)
  const [scoreData, setScoreData]       = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportReady, setReportReady]   = useState(false)
  const [answers, setAnswers]           = useState([])
  const [error, setError]               = useState(null)

  useEffect(() => {
    if (!sessionId) { navigate('/upload'); return }
    loadResults()
  }, [sessionId])

  const loadResults = async () => {
    try {
      const score = await getFinalScore(sessionId)
      setScoreData(score)

      // Fetch answers
      try {
        const res = await fetch(`/api/v1/sessions/${sessionId}/answers`)
        const data = await res.json()
        setAnswers(data.answers || [])
      } catch (_) {}

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = async () => {
    setReportLoading(true)
    try {
      await generateReport({
        session_id: sessionId,
        candidate_name: candidateName,
      })
      setReportReady(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setReportLoading(false)
    }
  }

  if (!sessionId) return null

  if (loading) return (
    <main className="page flex-center" style={{ minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          border: '3px solid var(--primary)', borderTopColor: 'transparent',
          margin: '0 auto 24px',
          animation: 'rotate-slow 0.8s linear infinite',
        }} />
        <h3 style={{ marginBottom: 8 }}>Computing your results...</h3>
        <p>Analyzing all your answers and generating insights</p>
      </div>
    </main>
  )

  if (error) return (
    <main className="page flex-center" style={{ minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
        <h3 style={{ marginBottom: 12 }}>Could not load results</h3>
        <p style={{ marginBottom: 24 }}>{error}</p>
        <Link to="/upload" className="btn btn-primary">Start New Interview</Link>
      </div>
    </main>
  )

  const overall    = scoreData?.overall_score ?? 0
  const rec        = scoreData?.recommendation ?? 'N/A'
  const recColor   = scoreData?.recommendation_color ?? '#6b7280'
  const techScore  = scoreData?.technical_score ?? 0
  const commScore  = scoreData?.communication_score ?? 0
  const faceScore  = scoreData?.face_score ?? 0
  const voiceScore = scoreData?.voice_score ?? 0

  const radarData = [
    { subject: 'Technical', score: techScore, fullMark: 100 },
    { subject: 'Communication', score: commScore, fullMark: 100 },
    { subject: 'Face Emotion', score: faceScore, fullMark: 100 },
    { subject: 'Voice Emotion', score: voiceScore, fullMark: 100 },
  ]

  const overallBar = [{ name: 'Score', value: overall, fill: recColor }]

  return (
    <main className="page" style={{ minHeight: '100vh', paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 900 }}>

        {/* ── Header ── */}
        <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>
            {overall >= 80 ? '🏆' : overall >= 65 ? '✅' : overall >= 50 ? '📊' : '📋'}
          </div>
          <h1 style={{ fontSize: '1.9rem', marginBottom: 8 }}>
            Interview Results for{' '}
            <span className="gradient-text">{candidateName || 'Candidate'}</span>
          </h1>
          <p>Here's your complete performance breakdown with personalized feedback</p>
        </div>

        {/* ── Overall Score + Recommendation ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32,
        }}>
          {/* Overall */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
            border: '1px solid var(--border-hover)',
            borderRadius: 20, padding: '32px 24px', textAlign: 'center',
          }}>
            <div style={{
              fontSize: '4rem', fontWeight: 900,
              background: `linear-gradient(135deg, var(--primary-light), var(--secondary))`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              lineHeight: 1, marginBottom: 8,
            }}>
              {overall.toFixed(1)}
            </div>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Overall Score / 100</div>
            <div className="progress-wrap" style={{ height: 8, marginTop: 16 }}>
              <div className="progress-bar" style={{ width: `${overall}%` }} />
            </div>
          </div>

          {/* Recommendation */}
          <div style={{
            background: `${recColor}15`,
            border: `1px solid ${recColor}40`,
            borderRadius: 20, padding: '32px 24px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              fontSize: '2rem', fontWeight: 800, color: recColor, marginBottom: 8,
            }}>
              {rec}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              AI Hiring Recommendation
            </div>
            <RecBadge rec={rec} color={recColor} />
          </div>
        </div>

        {/* ── Score Breakdown ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>

          {/* Radar chart */}
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Performance Radar</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(99,102,241,0.2)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Component scores */}
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Score Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ScoreBar label="Technical (50%)" score={techScore} color="#6366f1" />
              <ScoreBar label="Communication (20%)" score={commScore} color="#06b6d4" />
              <ScoreBar label="Face Emotion (15%)" score={faceScore} color="#8b5cf6" />
              <ScoreBar label="Voice Emotion (15%)" score={voiceScore} color="#a855f7" />
            </div>
            <div style={{
              marginTop: 16, padding: '10px 14px',
              background: 'var(--bg-surface)', borderRadius: 8,
              fontSize: '0.78rem', color: 'var(--text-muted)',
            }}>
              * Emotion scores are AI-estimated based on confidence indicators during your session.
            </div>
          </div>
        </div>

        {/* ── Answers Breakdown ── */}
        {answers.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ marginBottom: 20 }}>Question Breakdown</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {answers.map((ans, i) => (
                <AnswerCard key={i} index={i + 1} answer={ans} />
              ))}
            </div>
          </div>
        )}

        {/* ── PDF Report ── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.08))',
          border: '1px solid var(--border-hover)',
          borderRadius: 20, padding: '32px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>📋</div>
          <h3 style={{ marginBottom: 8 }}>Download Your Interview Report</h3>
          <p style={{ marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>
            Get a complete PDF report with your scores, per-question feedback, and hiring recommendation
            to share with mentors or review your performance.
          </p>

          {!reportReady ? (
            <button
              className="btn btn-primary btn-lg"
              onClick={handleDownloadReport}
              disabled={reportLoading}
              id="generate-report-btn"
            >
              {reportLoading ? '⟳ Generating PDF...' : '📄 Generate PDF Report'}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href={getReportDownloadUrl(sessionId)}
                download
                className="btn btn-primary btn-lg"
                id="download-report-btn"
              >
                ⬇️ Download Report PDF
              </a>
              <Link to="/upload" className="btn btn-outline btn-lg">
                Start New Interview
              </Link>
            </div>
          )}
        </div>

        {/* ── Start Again ── */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link to="/" className="btn btn-ghost">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreBar({ label, score, color }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between',
                    marginBottom: 5, fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{score.toFixed(0)}/100</span>
      </div>
      <div className="progress-wrap" style={{ height: 6 }}>
        <div style={{
          height: '100%', borderRadius: 100, width: `${score}%`,
          background: color, transition: 'width 0.8s ease',
        }} />
      </div>
    </div>
  )
}

function RecBadge({ rec, color }) {
  const desc = {
    'Strong Hire': 'Excellent performance across all areas.',
    'Hire':        'Strong candidate with minor gaps.',
    'Maybe':       'Good potential, needs improvement in some areas.',
    'No Hire':     'Significant improvement needed before interviewing.',
  }
  return (
    <div style={{
      padding: '8px 16px', borderRadius: 8,
      background: `${color}20`, border: `1px solid ${color}40`,
      fontSize: '0.8rem', color: 'var(--text-secondary)',
      maxWidth: 200, textAlign: 'center',
    }}>
      {desc[rec] || 'Interview complete.'}
    </div>
  )
}

function AnswerCard({ index, answer }) {
  const [expanded, setExpanded] = useState(false)
  const diff = answer.difficulty || 'medium'

  return (
    <div className="card" style={{ cursor: 'pointer' }}
         onClick={() => setExpanded(e => !e)}>
      <div style={{ display: 'flex', alignItems: 'flex-start',
                    gap: 12, justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Q{index}
            </span>
            <span className={`badge badge-${diff}`}>{diff}</span>
            <span className="badge badge-primary">{answer.skill}</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
            {answer.question_text}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
              {answer.technical_score?.toFixed(0)}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Tech</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>
              {answer.communication_score?.toFixed(0)}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Comm</div>
          </div>
          <div style={{ color: 'var(--text-muted)', alignSelf: 'center' }}>
            {expanded ? '▲' : '▼'}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="animate-fade-in" style={{ marginTop: 16, paddingTop: 16,
                                                   borderTop: '1px solid var(--border)' }}>
          {answer.answer_text && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4,
                            fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Your Answer
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)',
                          background: 'var(--bg-surface)', borderRadius: 8, padding: '10px 14px' }}>
                {answer.answer_text}
              </p>
            </div>
          )}

          {answer.feedback && (
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
              📝 {answer.feedback}
            </p>
          )}

          {answer.strengths?.length > 0 && answer.strengths.map((s, i) => (
            <div key={i} style={{ fontSize: '0.83rem', color: '#86efac', marginBottom: 4 }}>
              ✓ {s}
            </div>
          ))}

          {answer.improvements?.length > 0 && answer.improvements.map((imp, i) => (
            <div key={i} style={{ fontSize: '0.83rem', color: '#fcd34d', marginBottom: 4 }}>
              ⚠ {imp}
            </div>
          ))}

          {answer.keywords_matched?.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {answer.keywords_matched.map(k => (
                <span key={k} style={{
                  padding: '2px 8px', borderRadius: 4,
                  background: 'rgba(34,197,94,0.1)', color: '#86efac',
                  fontSize: '0.72rem', fontFamily: 'monospace',
                }}>{k}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
