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
  { id: 'ai', emoji: '🦁', label: 'AI Assistant' },
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
  const [profiles, setProfiles] = useState(() => {
    try {
      let savedProfiles = JSON.parse(localStorage.getItem('leo_profiles'))
      if (!savedProfiles || savedProfiles.length === 0) {
        // Migration from old single profile
        const oldProfile = JSON.parse(localStorage.getItem('leo_profile'))
        if (oldProfile) {
          oldProfile.id = 'legacy_profile'
          savedProfiles = [oldProfile]
          localStorage.setItem('leo_profiles', JSON.stringify(savedProfiles))
          localStorage.setItem('leo_active_profile_id', 'legacy_profile')
        } else {
          savedProfiles = []
        }
      }
      return savedProfiles
    } catch { return [] }
  })

  const [activeProfileId, setActiveProfileId] = useState(() => {
    return localStorage.getItem('leo_active_profile_id') || null
  })

  const profile = profiles.find(p => p.id === activeProfileId)

  const [page, setPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (profile?.accessibility) {
      document.documentElement.style.setProperty('--font-body-size', '16px')
      document.body.classList.add('a11y-mode')
    } else {
      document.body.classList.remove('a11y-mode')
    }
  }, [profile])

  function handleOnboardingComplete(p) {
    const newProfile = { ...p, id: Date.now().toString() }
    const newProfiles = [...profiles, newProfile]
    localStorage.setItem('leo_profiles', JSON.stringify(newProfiles))
    localStorage.setItem('leo_active_profile_id', newProfile.id)
    setProfiles(newProfiles)
    setActiveProfileId(newProfile.id)
    setPage('dashboard')
  }

  function handleSwitchAccount() {
    localStorage.removeItem('leo_active_profile_id')
    setActiveProfileId(null)
  }

  function handleSelectProfile(id) {
    if (id === 'new') {
      setActiveProfileId('new')
    } else {
      localStorage.setItem('leo_active_profile_id', id)
      setActiveProfileId(id)
    }
  }

  function handleDeleteProfile(e, id) {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this profile?")) {
      const newProfiles = profiles.filter(p => p.id !== id)
      setProfiles(newProfiles)
      localStorage.setItem('leo_profiles', JSON.stringify(newProfiles))
      if (activeProfileId === id) {
        setActiveProfileId(null)
        localStorage.removeItem('leo_active_profile_id')
      }
    }
  }

  if (!activeProfileId) {
    if (profiles.length > 0) {
      return (
        <div className="onboard-wrap">
          <div className="onboard-orb onboard-orb-1" aria-hidden="true" />
          <div className="onboard-orb onboard-orb-2" aria-hidden="true" />
          <div className="onboard-card anim-scale-in" style={{ padding: 40, width: 400 }}>
             <h1 className="onboard-title" style={{ marginBottom: 8, fontSize: 28 }}>Who is using Leo?</h1>
             <p className="onboard-sub" style={{ marginBottom: 24 }}>Select your account to continue.</p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               {profiles.map(p => (
                 <button key={p.id} className="btn btn-secondary" onClick={() => handleSelectProfile(p.id)} style={{ padding: '16px', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                     <div className="avatar" style={{ background: 'var(--accent)', color: 'white' }}>{p.name?.[0]?.toUpperCase() || '?'}</div>
                     <div style={{ textAlign: 'left', flex: 1 }}>
                       <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)' }}>{p.name}</div>
                       <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{JOB_EMOJIS[p.job] || '💼'} {p.job}</div>
                     </div>
                   </div>
                   <div
                     onClick={(e) => handleDeleteProfile(e, p.id)}
                     style={{
                       padding: '6px 10px', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e',
                       borderRadius: 'var(--radius-sm)', fontSize: 12, border: '1px solid rgba(244, 63, 94, 0.2)',
                       cursor: 'pointer'
                     }}
                     title="Delete Profile"
                   >
                     Delete
                   </div>
                 </button>
               ))}
               <button className="btn btn-primary" onClick={() => handleSelectProfile('new')} style={{ marginTop: 12, justifyContent: 'center' }}>
                 + Create New Account
               </button>
             </div>
          </div>
        </div>
      )
    }
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  if (activeProfileId === 'new') {
     return <Onboarding onComplete={handleOnboardingComplete} onCancel={profiles.length > 0 ? () => setActiveProfileId(null) : undefined} />
  }
  
  // If the profile object isn't found for some reason, reset to null
  if (!profile) {
    localStorage.removeItem('leo_active_profile_id')
    setActiveProfileId(null)
    return null
  }

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
          <div className="logo-icon" aria-hidden="true">🦁</div>
          {sidebarOpen && <span className="logo-text">Leo</span>}
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
            <div className="user-badge" role="status" aria-label={`Logged in as ${profile.name}, ${profile.job}`}>
              <div className="avatar" aria-hidden="true">{profile.name?.[0]?.toUpperCase() || '?'}</div>
              <div>
                <div className="user-name">{profile.name}</div>
                <div className="user-role">{JOB_EMOJIS[profile.job] || '💼'} {profile.job}</div>
              </div>
            </div>
            <button
              className="icon-btn"
              onClick={handleSwitchAccount}
              aria-label="Switch account"
              title="Switch account"
            >
              ⮀
            </button>
          </div>
        </header>

        {/* Pages */}
        <main>
          {page === 'dashboard' && <Dashboard profile={profile} onNavigate={setPage} />}
          {page === 'ai' && <AIChat profile={profile} onNavigate={setPage} />}
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
