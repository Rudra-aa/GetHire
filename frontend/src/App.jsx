import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Upload from './pages/Upload'
import Interview from './pages/Interview'
import Results from './pages/Results'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/"           element={<Landing />} />
        <Route path="/upload"     element={<Upload />} />
        <Route path="/interview"  element={<Interview />} />
        <Route path="/results"    element={<Results />} />
      </Routes>
    </div>
  )
}
