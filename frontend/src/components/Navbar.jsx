import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { to: '/',        label: 'Home' },
    { to: '/upload',  label: 'Start Interview' },
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      height: 'var(--nav-height)',
      display: 'flex', alignItems: 'center',
      background: scrolled ? 'rgba(10, 10, 20, 0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : 'none',
      transition: 'all 0.3s ease',
      padding: '0 24px',
    }}>
      <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: 'white',
          }}>G</div>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Get<span className="gradient-text">Hire</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: '0.9rem',
                fontWeight: 500,
                color: location.pathname === link.to ? 'var(--primary-light)' : 'var(--text-secondary)',
                background: location.pathname === link.to ? 'rgba(99,102,241,0.1)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/upload"
            className="btn btn-primary btn-sm"
            style={{ marginLeft: 8 }}
          >
            Try for Free →
          </Link>
        </div>
      </div>
    </nav>
  )
}
