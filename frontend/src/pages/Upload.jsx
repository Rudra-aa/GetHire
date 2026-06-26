import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { uploadResume, createSession, generateQuestions } from '../services/api'

const STEPS = ['Upload Resume', 'Reviewing Skills', 'Generating Questions']

export default function Upload() {
  const navigate = useNavigate()
  const [step, setStep]         = useState(0)  // 0=idle, 1=uploading, 2=reviewing, 3=generating
  const [error, setError]       = useState(null)
  const [resumeData, setResumeData] = useState(null)  // {skills, pages, filename, text}
  const [selectedSkills, setSelectedSkills] = useState([])
  const [candidateName, setCandidateName]   = useState('')

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return
    setError(null)
    setStep(1)

    try {
      const data = await uploadResume(file)
      setResumeData(data)
      setSelectedSkills(data.skills || [])
      setStep(2)
    } catch (err) {
      setError(err.message)
      setStep(0)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: step > 0,
  })

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  const startInterview = async () => {
    if (selectedSkills.length === 0) {
      setError('Select at least one skill to continue.')
      return
    }
    setError(null)
    setStep(3)

    try {
      // Create session
      const session = await createSession({
        candidate_name: candidateName || 'Candidate',
        skills: selectedSkills,
        resume_text: resumeData?.text || '',
      })

      // Generate questions
      const questionsData = await generateQuestions({
        skills: selectedSkills,
        session_id: session.session_id,
      })

      // Navigate to interview
      navigate('/interview', {
        state: {
          sessionId:     session.session_id,
          candidateName: candidateName || 'Candidate',
          questions:     questionsData.questions,
          skills:        selectedSkills,
        }
      })
    } catch (err) {
      setError(err.message)
      setStep(2)
    }
  }

  return (
    <main className="page" style={{ minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 720, paddingTop: 40, paddingBottom: 60 }}>

        {/* Page header */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: 10 }}>
            <span className="gradient-text">Upload Your Resume</span>
          </h1>
          <p>We'll extract your skills and create a personalized interview just for you.</p>
        </div>

        {/* Progress steps */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginBottom: 48 }}>
          {['Upload', 'Review Skills', 'Start Interview'].map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: i < step
                    ? 'var(--primary)'
                    : i === (step === 2 ? 1 : step === 3 ? 2 : 0)
                      ? 'var(--primary)'
                      : 'var(--bg-elevated)',
                  border: '2px solid',
                  borderColor: i <= (step === 2 ? 1 : step === 3 ? 2 : 0)
                    ? 'var(--primary)' : 'var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700,
                  color: i <= (step === 2 ? 1 : step === 3 ? 2 : 0) ? 'white' : 'var(--text-muted)',
                  transition: 'all 0.3s',
                }}>
                  {i < (step === 2 ? 1 : step === 3 ? 2 : 0) ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div style={{
                  width: 80, height: 2, margin: '0 8px', marginBottom: 20,
                  background: i < (step === 2 ? 1 : step === 3 ? 2 : 0)
                    ? 'var(--primary)' : 'var(--border)',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 24,
            color: '#fca5a5', fontSize: '0.9rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Step 0: Dropzone ── */}
        {step === 0 && (
          <div
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 20,
              padding: '60px 40px',
              textAlign: 'center',
              background: isDragActive ? 'rgba(99,102,241,0.08)' : 'var(--bg-card)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = isDragActive ? 'var(--primary)' : 'var(--border)'}
          >
            <input {...getInputProps()} />
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>📄</div>
            <h3 style={{ marginBottom: 8, color: 'var(--text-primary)' }}>
              {isDragActive ? 'Drop your resume here!' : 'Drag & drop your resume'}
            </h3>
            <p style={{ marginBottom: 20, fontSize: '0.9rem' }}>
              or click to browse — PDF only, max 10 MB
            </p>
            <button className="btn btn-primary">Choose PDF File</button>
          </div>
        )}

        {/* ── Step 1: Uploading ── */}
        {step === 1 && (
          <div className="card-elevated" style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              border: '3px solid var(--primary)', borderTopColor: 'transparent',
              margin: '0 auto 24px',
              animation: 'rotate-slow 0.8s linear infinite',
            }} />
            <h3 style={{ marginBottom: 8 }}>Processing your resume...</h3>
            <p>Extracting text and identifying your technical skills</p>
          </div>
        )}

        {/* ── Step 2: Review Skills ── */}
        {step === 2 && resumeData && (
          <div className="animate-fade-in">
            {/* Resume meta */}
            <div style={{
              background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 12, padding: '16px 20px', marginBottom: 24,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: '1.5rem' }}>✅</span>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  {resumeData.filename}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {resumeData.pages} page{resumeData.pages !== 1 ? 's' : ''} · {resumeData.skill_count} skills detected
                </div>
              </div>
            </div>

            {/* Candidate name */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600,
                              fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Your Name (for the report)
              </label>
              <input
                className="input"
                placeholder="e.g. Rudra Pratap Singh"
                value={candidateName}
                onChange={e => setCandidateName(e.target.value)}
              />
            </div>

            {/* Skills selection */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Skills Detected — Select for Interview
                </label>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedSkills.length} / {resumeData.skills.length} selected
                </span>
              </div>

              {resumeData.skills.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '32px',
                  background: 'var(--bg-card)', borderRadius: 12,
                  color: 'var(--text-muted)', fontSize: '0.9rem',
                }}>
                  No skills detected. Make sure your resume has text (not scanned images).
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {resumeData.skills.map(skill => {
                    const selected = selectedSkills.includes(skill)
                    return (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        style={{
                          padding: '7px 14px', borderRadius: 8, border: '1px solid',
                          borderColor: selected ? 'var(--primary)' : 'var(--border)',
                          background: selected ? 'rgba(99,102,241,0.15)' : 'var(--bg-card)',
                          color: selected ? 'var(--primary-light)' : 'var(--text-secondary)',
                          cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                          fontFamily: 'inherit', transition: 'all 0.15s',
                        }}
                      >
                        {selected ? '✓ ' : ''}{skill}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
                onClick={startInterview}
                disabled={selectedSkills.length === 0}
              >
                Start Interview ({selectedSkills.length} skills)
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => { setStep(0); setResumeData(null); setError(null); }}
              >
                Re-upload
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Generating ── */}
        {step === 3 && (
          <div className="card-elevated" style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              border: '3px solid var(--secondary)', borderTopColor: 'transparent',
              margin: '0 auto 24px',
              animation: 'rotate-slow 0.8s linear infinite',
            }} />
            <h3 style={{ marginBottom: 8 }}>Generating your interview...</h3>
            <p>Selecting questions across {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''}</p>
            <div style={{
              marginTop: 20, display: 'flex', flexWrap: 'wrap',
              gap: 8, justifyContent: 'center',
            }}>
              {selectedSkills.map(s => (
                <span key={s} className="badge badge-primary">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
