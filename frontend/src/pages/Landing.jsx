import { Link } from 'react-router-dom'

const features = [
  {
    icon: '📄',
    title: 'Resume Intelligence',
    desc: 'Upload your PDF resume. Our AI extracts skills, projects, and technologies automatically — no manual input needed.',
    color: '#6366f1',
  },
  {
    icon: '🤖',
    title: 'AI Interview Engine',
    desc: 'Get personalized technical questions based on YOUR resume. Easy, medium, and hard difficulty questions across all your skills.',
    color: '#8b5cf6',
  },
  {
    icon: '😊',
    title: 'Emotion Analysis',
    desc: 'Real-time face and voice emotion detection tracks your confidence throughout the interview session.',
    color: '#06b6d4',
  },
  {
    icon: '📊',
    title: 'Deep Evaluation',
    desc: 'Each answer is scored on technical accuracy and communication quality with detailed feedback and improvement tips.',
    color: '#f59e0b',
  },
  {
    icon: '🏆',
    title: 'Final Scoring',
    desc: 'Weighted scoring across Technical (50%), Communication (20%), Face (15%), and Voice (15%) produces a hiring recommendation.',
    color: '#22c55e',
  },
  {
    icon: '📋',
    title: 'PDF Reports',
    desc: 'Download a comprehensive interview report with question-by-question analysis and your final recommendation.',
    color: '#ef4444',
  },
]

const steps = [
  { num: '01', title: 'Upload Resume', desc: 'Drop your PDF — skills extracted instantly' },
  { num: '02', title: 'AI Generates Questions', desc: 'Personalized questions based on your skills' },
  { num: '03', title: 'Interview Session', desc: 'Answer at your own pace with emotion tracking' },
  { num: '04', title: 'Get Your Report', desc: 'Detailed PDF report with hiring recommendation' },
]

const stats = [
  { val: '100+', label: 'Interview Questions' },
  { val: '8',    label: 'Skills Covered' },
  { val: '3',    label: 'Difficulty Levels' },
  { val: '∞',    label: 'Free to Use' },
]

export default function Landing() {
  return (
    <main style={{ overflowX: 'hidden' }}>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', textAlign: 'center',
        padding: '120px 24px 80px',
      }}>
        {/* Background gradient orbs */}
        <div style={{
          position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0,
        }}>
          <div style={{
            position: 'absolute', top: '15%', left: '10%',
            width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '10%', right: '5%',
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 800, height: 2,
            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)',
            transform: 'translate(-50%, -50%)',
          }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}
             className="animate-fade-in">
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 100,
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
            fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-light)',
            marginBottom: 24,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)',
                           animation: 'pulse-glow 2s infinite' }} />
            AI-Powered Interview Platform — Free Forever
          </div>

          <h1 style={{ marginBottom: 24 }}>
            Ace Your Next{' '}
            <span className="gradient-text">Technical Interview</span>
            <br />with AI Coaching
          </h1>

          <p style={{ fontSize: '1.15rem', maxWidth: 580, margin: '0 auto 40px', color: 'var(--text-secondary)' }}>
            Upload your resume → Get personalized questions → Practice with emotion analysis →
            Receive a detailed hiring report. All powered by AI. All for free.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/upload" className="btn btn-primary btn-lg">
              Start Free Interview →
            </Link>
            <a href="#how-it-works" className="btn btn-outline btn-lg">
              How It Works
            </a>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex', gap: 32, justifyContent: 'center',
            marginTop: 60, flexWrap: 'wrap',
          }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{s.val}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section id="how-it-works" style={{
        padding: '80px 24px',
        background: 'rgba(99,102,241,0.03)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2>How <span className="gradient-text">GetHire</span> Works</h2>
            <p style={{ marginTop: 12, maxWidth: 500, margin: '12px auto 0' }}>
              Four simple steps from resume to hiring recommendation
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24, position: 'relative',
          }}>
            {steps.map((step, i) => (
              <div key={step.num} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 16, padding: '28px 24px',
                position: 'relative',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{
                  fontSize: '2.5rem', fontWeight: 900, color: 'transparent',
                  WebkitTextStroke: '1px rgba(99,102,241,0.3)',
                  marginBottom: 12, lineHeight: 1,
                }}>{step.num}</div>
                <h3 style={{ marginBottom: 8, color: 'var(--text-primary)' }}>{step.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{step.desc}</p>
                {i < steps.length - 1 && (
                  <div style={{
                    position: 'absolute', top: '50%', right: -12,
                    fontSize: '1.2rem', color: 'var(--primary)',
                    display: 'none', // hide on mobile
                  }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2>Everything You Need to <span className="gradient-text">Get Hired</span></h2>
            <p style={{ marginTop: 12 }}>A complete AI interview platform — no paid APIs, no sign-up required</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
          }}>
            {features.map(f => (
              <div key={f.title}
                className="card"
                style={{ cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = f.color + '40'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: f.color + '15',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', marginBottom: 16,
                  border: `1px solid ${f.color}30`,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ marginBottom: 8, color: 'var(--text-primary)' }}>{f.title}</h3>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section style={{ padding: '60px 24px 80px' }}>
        <div style={{
          maxWidth: 700, margin: '0 auto', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))',
          border: '1px solid var(--border-hover)',
          borderRadius: 24, padding: '56px 40px',
        }}>
          <h2 style={{ marginBottom: 16 }}>Ready to <span className="gradient-text">Practice?</span></h2>
          <p style={{ marginBottom: 32 }}>
            Upload your resume and start your personalized AI interview in under 60 seconds.
            Get actionable feedback and a PDF report instantly.
          </p>
          <Link to="/upload" className="btn btn-primary btn-lg">
            Upload Resume & Start → 
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
      }}>
        <span>© 2025 GetHire — AI-Powered Technical Interview Platform</span>
        <span style={{ margin: '0 12px', color: 'var(--border)' }}>|</span>
        <span>Built for students & job seekers</span>
      </footer>
    </main>
  )
}
