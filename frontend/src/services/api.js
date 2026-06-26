import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
})

// Request interceptor for logging
api.interceptors.request.use((config) => {
  return config
})

// Response interceptor
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.detail || err.message || 'An error occurred'
    return Promise.reject(new Error(message))
  }
)

// ── Resume ──────────────────────────────────────────────────────────────────

export const uploadResume = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/upload-resume', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// ── Sessions ─────────────────────────────────────────────────────────────────

export const createSession = (data) => api.post('/sessions', data)
export const getSession = (sessionId) => api.get(`/sessions/${sessionId}`)

// ── Questions ────────────────────────────────────────────────────────────────

export const generateQuestions = (data) => api.post('/generate-questions', data)
export const getSessionQuestions = (sessionId) => api.get(`/sessions/${sessionId}/questions`)

// ── Follow-up ────────────────────────────────────────────────────────────────

export const getFollowUp = (data) => api.post('/follow-up', data)

// ── Evaluation ───────────────────────────────────────────────────────────────

export const evaluateAnswer = (data) => api.post('/evaluate-answer', data)
export const getFinalScore = (sessionId) => api.get(`/score/${sessionId}`)
export const computeScore = (data) => api.post('/score', data)

// ── Report ───────────────────────────────────────────────────────────────────

export const generateReport = (data) => api.post('/report', data)
export const getReportDownloadUrl = (sessionId) => `/api/v1/report/download/${sessionId}`
