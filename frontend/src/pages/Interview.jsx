import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { evaluateAnswer, getFollowUp, getFinalScore } from '../services/api'

const SECONDS_PER_QUESTION = 120

export default function Interview() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state || {}
  const { sessionId, candidateName, questions = [], skills = [] } = state

  const [currentIdx, setCurrentIdx]   = useState(0)
  const [answer, setAnswer]           = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [evaluation, setEvaluation]   = useState(null)   // last eval result
  const [followUp, setFollowUp]       = useState(null)   // follow-up question
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [followUpAnswer, setFollowUpAnswer] = useState('')
  const [timeLeft, setTimeLeft]       = useState(SECONDS_PER_QUESTION)
  const [completed, setCompleted]     = useState(false)
  const [error, setError]             = useState(null)
  const [cameraAllowed, setCameraAllowed] = useState(false)
  const [emotionLabel, setEmotionLabel] = useState('Neutral')
  const videoRef = useRef(null)
  const timerRef = useRef(null)
  const startTimeRef = useRef(Date.now())

  // Redirect if no session
  useEffect(() => {
    if (!sessionId || questions.length === 0) {
      navigate('/upload')
    }
  }, [sessionId, questions])

  // Camera
  useEffect(() => {
    let stream
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(s => {
        stream = s
        setCameraAllowed(true)
        if (videoRef.current) videoRef.current.srcObject = s
        // Simulate emotion changes every 5 seconds
        const emotions = ['Neutral', 'Confident', 'Focused', 'Thinking', 'Engaged']
        const emotionTimer = setInterval(() => {
          setEmotionLabel(emotions[Math.floor(Math.random() * emotions.length)])
        }, 5000)
        return () => clearInterval(emotionTimer)
      })
      .catch(() => setCameraAllowed(false))
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()) }
  }, [])

  // Timer per question
  useEffect(() => {
    setTimeLeft(SECONDS_PER_QUESTION)
    startTimeRef.current = Date.now()
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [currentIdx])

  if (!sessionId || questions.length === 0) return null

  const question = questions[currentIdx]
  const progress = ((currentIdx) / questions.length) * 100
  const timePct  = (timeLeft / SECONDS_PER_QUESTION) * 100
  const timerColor = timeLeft > 60 ? 'var(--primary)' : timeLeft > 30 ? 'var(--maybe)' : 'var(--no-hire)'

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) { setError('Please type your answer before submitting.'); return }
    setError(null)
    setSubmitting(true)
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000)

    try {
      const result = await evaluateAnswer({
        session_id:          sessionId,
        question_id:         question.id,
        question_text:       question.question,
        answer_text:         answer,
        skill:               question.skill,
        difficulty:          question.difficulty,
        time_taken_seconds:  timeTaken,
      })
      setEvaluation(result)

      // Optionally get a follow-up
      try {
        const fu = await getFollowUp({
          session_id:       sessionId,
          question:         question.question,
          candidate_answer: answer,
          skill:            question.skill,
        })
        setFollowUp(fu.follow_up_question)
      } catch (_) {}

    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    setEvaluation(null)
    setFollowUp(null)
    setShowFollowUp(false)
    setFollowUpAnswer('')
    setAnswer('')
    setError(null)

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1)
    } else {
      setCompleted(true)
    }
  }

  const handleFinish = async () => {
    navigate('/results', {
      state: { sessionId, candidateName, skills }
    })
  }

  const diffBadgeClass = `badge badge-${question?.difficulty}`

  return (
    <main className="page" style={{ minHeight: '100vh', paddingBottom: 60 }}>
      <div className="container" style={{ maxWidth: 900 }}>

        {/* Completed */}
        {completed ? (
          <div className="animate-fade-in" style={{
            textAlign: 'center', paddingTop: 60,
          }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>🎉</div>
            <h2 style={{ marginBottom: 12 }}>Interview <span className="gradient-text">Complete!</span></h2>
            <p style={{ marginBottom: 32 }}>
              You've answered all {questions.length} questions. Your results are being compiled.
            </p>
            <button className="btn btn-primary btn-lg" onClick={handleFinish}>
              View My Results →
            </button>
          </div>
        ) : (
          <>
            {/* ── Top bar ── */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 24, gap: 16, flexWrap: 'wrap',
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                  Question {currentIdx + 1} of {questions.length}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="badge badge-primary">{question.skill}</span>
                  <span className={diffBadgeClass}>{question.difficulty}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Topic: {question.topic}
                  </span>
                </div>
              </div>

              {/* Timer */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '8px 16px',
              }}>
                <span style={{ fontSize: '1.1rem' }}>⏱</span>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700, fontSize: '1.1rem',
                  color: timerColor, minWidth: 40, textAlign: 'right',
                }}>
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Overall progress */}
            <div className="progress-wrap" style={{ height: 4, marginBottom: 32 }}>
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>

            {/* ── Main 2-col layout ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24 }}>

              {/* Left: Question + Answer */}
              <div>
                {/* Question card */}
                <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(99,102,241,0.3)' }}>
                  {/* Timer bar */}
                  <div className="progress-wrap" style={{ height: 3, marginBottom: 16 }}>
                    <div style={{
                      height: '100%', borderRadius: 100, width: `${timePct}%`,
                      background: `linear-gradient(90deg, ${timerColor}, ${timerColor}88)`,
                      transition: 'width 1s linear, background 0.5s',
                    }} />
                  </div>
                  <p style={{
                    fontSize: '1.05rem', fontWeight: 600,
                    color: 'var(--text-primary)', lineHeight: 1.65,
                  }}>
                    {question.question}
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                    color: '#fca5a5', fontSize: '0.88rem',
                  }}>⚠️ {error}</div>
                )}

                {/* Answer textarea */}
                {!evaluation && (
                  <>
                    <textarea
                      className="input"
                      style={{ minHeight: 160, marginBottom: 16 }}
                      placeholder="Type your answer here... Be specific and use technical terms you know."
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      disabled={submitting}
                    />
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        onClick={handleSubmitAnswer}
                        disabled={submitting || !answer.trim()}
                        id="submit-answer-btn"
                      >
                        {submitting ? 'Evaluating...' : 'Submit Answer →'}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={handleNext}
                        title="Skip this question"
                      >
                        Skip
                      </button>
                    </div>
                  </>
                )}

                {/* Evaluation result */}
                {evaluation && (
                  <div className="animate-fade-in">
                    {/* Score cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                      <ScoreMini label="Technical" score={evaluation.technical_score} color="var(--primary)" />
                      <ScoreMini label="Communication" score={evaluation.communication_score} color="var(--accent)" />
                    </div>

                    {/* Feedback */}
                    <div className="card" style={{ marginBottom: 16 }}>
                      <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 12 }}>
                        {evaluation.feedback}
                      </p>

                      {evaluation.strengths?.length > 0 && (
                        <div style={{ marginBottom: 10 }}>
                          {evaluation.strengths.map((s, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4,
                                                  fontSize: '0.85rem', color: '#86efac' }}>
                              <span>✓</span><span>{s}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {evaluation.improvements?.length > 0 && (
                        <div>
                          {evaluation.improvements.map((imp, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4,
                                                  fontSize: '0.85rem', color: '#fcd34d' }}>
                              <span>⚠</span><span>{imp}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Keywords matched */}
                    {evaluation.keywords_matched?.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                          Keywords matched:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {evaluation.keywords_matched.map(k => (
                            <span key={k} style={{
                              padding: '2px 8px', borderRadius: 4,
                              background: 'rgba(34,197,94,0.1)', color: '#86efac',
                              fontSize: '0.75rem', fontFamily: 'monospace',
                            }}>{k}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-up toggle */}
                    {followUp && !showFollowUp && (
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ marginBottom: 16 }}
                        onClick={() => setShowFollowUp(true)}
                      >
                        💬 Show Follow-up Question
                      </button>
                    )}

                    {showFollowUp && followUp && (
                      <div className="card" style={{
                        borderColor: 'rgba(139,92,246,0.4)', marginBottom: 16,
                        background: 'rgba(139,92,246,0.05)',
                      }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginBottom: 8,
                                      fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Follow-up
                        </div>
                        <p style={{ fontSize: '0.93rem', color: 'var(--text-primary)' }}>{followUp}</p>
                        <textarea
                          className="input"
                          style={{ marginTop: 12, minHeight: 80 }}
                          placeholder="Optional: add your follow-up answer..."
                          value={followUpAnswer}
                          onChange={e => setFollowUpAnswer(e.target.value)}
                        />
                      </div>
                    )}

                    <button
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      onClick={handleNext}
                      id="next-question-btn"
                    >
                      {currentIdx < questions.length - 1 ? 'Next Question →' : 'Finish Interview 🏁'}
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Webcam + Info ── */}
              <div>
                {/* Webcam */}
                <div className="card" style={{ marginBottom: 16, padding: 12 }}>
                  <div style={{
                    background: 'var(--bg-base)', borderRadius: 10,
                    aspectRatio: '4/3', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}>
                    {cameraAllowed ? (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay muted playsInline
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {/* Emotion overlay */}
                        <div style={{
                          position: 'absolute', bottom: 8, left: 8,
                          background: 'rgba(0,0,0,0.7)', borderRadius: 6,
                          padding: '4px 10px', fontSize: '0.75rem',
                          display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%',
                                         background: 'var(--strong-hire)', animation: 'pulse-glow 1.5s infinite' }} />
                          <span style={{ color: '#86efac' }}>{emotionLabel}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 16 }}>
                        <div style={{ fontSize: '2rem', marginBottom: 8 }}>📷</div>
                        <div style={{ fontSize: '0.78rem' }}>Camera not enabled</div>
                        <div style={{ fontSize: '0.7rem', marginTop: 4 }}>Enable for emotion analysis</div>
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 8, textAlign: 'center', fontSize: '0.72rem',
                                color: 'var(--text-muted)' }}>
                    🤖 Emotion: <strong style={{ color: 'var(--text-secondary)' }}>{emotionLabel}</strong>
                  </div>
                </div>

                {/* Session info */}
                <div className="card" style={{ fontSize: '0.82rem' }}>
                  <div style={{ color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600,
                                fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Session
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>
                    👤 {candidateName}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>
                    📋 {questions.length} questions
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    🎯 {skills.length} skills
                  </div>

                  {/* Q progress dots */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 12 }}>
                    {questions.map((_, i) => (
                      <div key={i} style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: i < currentIdx
                          ? 'var(--primary)'
                          : i === currentIdx
                            ? 'var(--primary-light)'
                            : 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

function ScoreMini({ label, score, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '12px 16px',
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{score.toFixed(0)}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
      <div className="progress-wrap" style={{ height: 3, marginTop: 6 }}>
        <div style={{
          height: '100%', borderRadius: 100, width: `${score}%`,
          background: color, transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}
