import { useState, useEffect } from 'react'
import Onboarding from './components/Onboarding'
import Dashboard from './components/Dashboard'
import AIChat from './components/AIChat'
import Timer from './components/Timer'
import Scheduler from './components/Scheduler'
import Notes from './components/Notes'
import CallRecorder from './components/CallRecorder'
import FileOrganizer from './components/FileOrganizer'

const NAV_ITEMS = [
  { id: 'dashboard', emoji: '🏠', label: 'Dashboard' },
  { id: 'ai', emoji: '🐦‍⬛', label: 'AI Assistant' },
  { id: 'timer', emoji: '⏱', label: 'Focus Timer' },
  { id: 'schedule', emoji: '📅', label: 'Schedule' },
  { id: 'notes', emoji: '📝', label: 'Notes' },
  { id: 'calls', emoji: '🎙', label: 'Calls' },
  { id: 'files', emoji: '📁', label: 'Files' },
]

const JOB_EMOJIS = {
  developer: '💻', designer: '🎨', marketer: '📊', lawyer: '⚖️',
  doctor: '🩺', teacher: '🎓', accountant: '🧾', manager: '📋',
  journalist: '📰', researcher: '🔬', sales: '🤝', engineer: '⚙️',
}

export default function App() {
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('corvus_profile')) } catch { return null }
  })
  const [page, setPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('corvus_theme') || 'purple')

  useEffect(() => {
    if (profile?.accessibility) {
      document.documentElement.style.setProperty('--font-body-size', '16px')
      document.body.classList.add('a11y-mode')
    } else {
      document.body.classList.remove('a11y-mode')
    }
  }, [profile])

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
    localStorage.setItem('corvus_theme', theme)
  }, [theme])

  function handleOnboardingComplete(p) {
    localStorage.setItem('corvus_profile', JSON.stringify(p))
    setProfile(p)
    setPage('dashboard')
  }

  function resetProfile() {
    localStorage.removeItem('corvus_profile')
    setProfile(null)
  }

  if (!profile) return <Onboarding onComplete={handleOnboardingComplete} />

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <div className="app-shell">
      {/* Skip to content link for keyboard users */}
      <a href="#main-content" className="sr-only" style={{ position: 'absolute', top: 8, left: 8, zIndex: 9999, padding: '8px 16px', background: 'var(--accent)', color: 'white', borderRadius: 8, fontSize: 14 }}>
        Skip to content
      </a>

      {/* Sidebar */}
      <nav
        className={`sidebar${sidebarOpen ? ' expanded' : ''}`}
        aria-label="Main navigation"
      >
        <div className="sidebar-logo">
          <div className="logo-icon" aria-hidden="true">🐦‍⬛</div>
          {sidebarOpen && <span className="logo-text">Corvus</span>}
        </div>

        <div className="nav-items" role="list">
          {NAV_ITEMS.map(item => (
            <div key={item.id} className="tooltip-wrap" role="listitem">
              <button
                className={`nav-item${page === item.id ? ' active' : ''}`}
                onClick={() => setPage(item.id)}
                aria-current={page === item.id ? 'page' : undefined}
                aria-label={item.label}
              >
                <span className="nav-icon" aria-hidden="true">{item.emoji}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
              {!sidebarOpen && <div className="tooltip" role="tooltip">{item.label}</div>}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button
            className="toggle-btn"
            onClick={() => setSidebarOpen(o => !o)}
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            style={{ width: sidebarOpen ? '100%' : undefined, justifyContent: 'center' }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
      </nav>

      {/* Main */}
      <div className={`main-content${sidebarOpen ? ' shifted' : ''}`} id="main-content">
        {/* Topbar */}
        <header className="topbar" role="banner">
          <div className="topbar-left">
            <div className="topbar-greeting">{NAV_ITEMS.find(n => n.id === page)?.label || 'Dashboard'}</div>
            <div className="topbar-sub">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          </div>
          <div className="topbar-right">
            <div style={{ display: 'flex', gap: '8px', marginRight: '8px', alignItems: 'center' }}>
              {['purple', 'green', 'rose', 'amber', 'blue'].map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  aria-label={`Theme ${t}`}
                  title={`Theme ${t}`}
                  style={{
                    width: 14, height: 14, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: t === 'purple' ? '#6366f1' : t === 'green' ? '#10b981' : t === 'rose' ? '#f43f5e' : t === 'amber' ? '#f59e0b' : '#3b82f6',
                    outline: theme === t ? '2px solid var(--text-primary)' : 'none', outlineOffset: 2,
                    opacity: theme === t ? 1 : 0.6
                  }}
                />
              ))}
            </div>
            <div className="user-badge" role="status" aria-label={`Logged in as ${profile.name}, ${profile.job}`}>
              <div className="avatar" aria-hidden="true">{profile.name?.[0]?.toUpperCase() || '?'}</div>
              <div>
                <div className="user-name">{profile.name}</div>
                <div className="user-role">{JOB_EMOJIS[profile.job] || '💼'} {profile.job}</div>
              </div>
            </div>
            <button
              className="icon-btn"
              onClick={resetProfile}
              aria-label="Reset profile / log out"
              title="Reset profile"
            >
              ⚙
            </button>
          </div>
        </header>

        {/* Pages */}
        <main>
          {page === 'dashboard' && <Dashboard profile={profile} onNavigate={setPage} />}
          {page === 'ai' && <AIChat profile={profile} />}
          {page === 'timer' && <Timer />}
          {page === 'schedule' && <Scheduler />}
          {page === 'notes' && <Notes />}
          {page === 'calls' && <CallRecorder profile={profile} />}
          {page === 'files' && <FileOrganizer />}
        </main>
      </div>
    </div>
  )
}
