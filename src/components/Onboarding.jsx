import { useState } from 'react'

const JOBS = [
  { id: 'developer', emoji: '💻', name: 'Developer' },
  { id: 'designer', emoji: '🎨', name: 'Designer' },
  { id: 'marketer', emoji: '📊', name: 'Marketer' },
  { id: 'lawyer', emoji: '⚖️', name: 'Lawyer' },
  { id: 'doctor', emoji: '🩺', name: 'Doctor' },
  { id: 'teacher', emoji: '🎓', name: 'Teacher' },
  { id: 'accountant', emoji: '🧾', name: 'Accountant' },
  { id: 'manager', emoji: '📋', name: 'Manager' },
  { id: 'journalist', emoji: '📰', name: 'Journalist' },
  { id: 'researcher', emoji: '🔬', name: 'Researcher' },
  { id: 'sales', emoji: '🤝', name: 'Sales' },
  { id: 'engineer', emoji: '⚙️', name: 'Engineer' },
  { id: 'nurse', emoji: '💊', name: 'Nurse' },
  { id: 'chef', emoji: '🍳', name: 'Chef' },
  { id: 'architect', emoji: '🏛️', name: 'Architect' },
  { id: 'other', emoji: '✨', name: 'Other…' },
]

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState({
    name: '', job: '', customJob: '', company: '', accessibility: false
  })

  const effectiveJob = profile.job === 'other' ? (profile.customJob.trim() || 'other') : profile.job
  const canNext = [
    profile.name.trim().length > 0,
    profile.job !== '' && (profile.job !== 'other' || profile.customJob.trim().length > 0),
    true,
  ]

  const steps = ['Welcome', 'Your Role', 'Preferences']

  function handleFinish() {
    onComplete({ ...profile, job: effectiveJob })
  }

  return (
    <div className="onboard-wrap">
      <div className="onboard-orb onboard-orb-1" aria-hidden="true" />
      <div className="onboard-orb onboard-orb-2" aria-hidden="true" />

      <div className="onboard-card anim-scale-in">
        <div className="onboard-logo">
          <div className="onboard-logo-icon" aria-hidden="true">🦁</div>
          <span className="onboard-logo-text">Leo</span>
        </div>

        <div
          className="step-dots"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemax={steps.length}
          aria-label={`Step ${step + 1} of ${steps.length}: ${steps[step]}`}
        >
          {steps.map((_, i) => (
            <div key={i} className={`step-dot${i === step ? ' active' : ''}`} />
          ))}
        </div>

        {/* ─── Step 0: Name ──────────────────────── */}
        {step === 0 && (
          <div className="onboard-step anim-fade-up">
            <h1 className="onboard-title">Hi, I'm Leo 👋</h1>
            <p className="onboard-sub">
              Your AI work assistant. I adapt completely to <em>your</em> job, keep you
              organised, and help you stay on top of everything — whoever you are.
              Let's get you set up.
            </p>
            <div className="input-wrap" style={{ marginBottom: 24 }}>
              <label className="input-label" htmlFor="onboard-name">Your Name</label>
              <input
                id="onboard-name"
                className="input"
                placeholder="e.g. Alex Johnson"
                value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && canNext[0] && setStep(1)}
                autoFocus
              />
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setStep(1)}
              disabled={!canNext[0]}
            >
              Continue →
            </button>
          </div>
        )}

        {/* ─── Step 1: Job ───────────────────────── */}
        {step === 1 && (
          <div className="onboard-step anim-fade-up">
            <h2 className="onboard-title" style={{ fontSize: 28, marginBottom: 10 }}>
              <span className="text-gradient">What's your role?</span>
            </h2>
            <p className="onboard-sub" style={{ color: '#e2e8f0', fontWeight: 500, marginBottom: 24 }}>
              Leo tailors news, suggestions, tips, and prompts to your profession.
              Don't see your role? Pick <strong style={{ color: '#818cf8' }}>Other</strong> and type it in.
            </p>

            <div className="job-grid" role="radiogroup" aria-label="Select your job role">
              {JOBS.map(j => (
                <button
                  key={j.id}
                  className={`job-tile${profile.job === j.id ? ' selected' : ''}`}
                  onClick={() => setProfile(p => ({ ...p, job: j.id }))}
                  role="radio"
                  aria-checked={profile.job === j.id}
                >
                  <span className="job-tile-emoji" aria-hidden="true">{j.emoji}</span>
                  <span className="job-tile-name" style={{ color: '#f1f5f9', fontWeight: 700 }}>{j.name}</span>
                </button>
              ))}
            </div>

            {/* Custom job input shows when "Other" is selected */}
            {profile.job === 'other' && (
              <div className="input-wrap anim-fade-up" style={{ marginBottom: 16 }}>
                <label className="input-label" htmlFor="custom-job">Your Job Title</label>
                <input
                  id="custom-job"
                  className="input"
                  placeholder="e.g. Physiotherapist, Music Producer, Pilot…"
                  value={profile.customJob}
                  onChange={e => setProfile(p => ({ ...p, customJob: e.target.value }))}
                  autoFocus
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setStep(0)}>← Back</button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setStep(2)}
                disabled={!canNext[1]}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 2: Prefs ─────────────────────── */}
        {step === 2 && (
          <div className="onboard-step anim-fade-up">
            <h2 className="onboard-title">Almost ready!</h2>
            <p className="onboard-sub">
              A couple of quick preferences to personalise your experience as a{' '}
              <span className="text-gradient" style={{ fontWeight: 700 }}>{effectiveJob}</span>.
            </p>

            <div className="input-wrap" style={{ marginBottom: 16 }}>
              <label className="input-label" htmlFor="onboard-company">Company / Organisation (optional)</label>
              <input
                id="onboard-company"
                className="input"
                placeholder="e.g. Acme Corp"
                value={profile.company}
                onChange={e => setProfile(p => ({ ...p, company: e.target.value }))}
              />
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 28, padding: '14px',
              background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Accessibility Mode</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Larger text, high contrast, keyboard nav</div>
              </div>
              <button
                className={`toggle${profile.accessibility ? ' on' : ''}`}
                onClick={() => setProfile(p => ({ ...p, accessibility: !p.accessibility }))}
                role="switch"
                aria-checked={profile.accessibility}
                aria-label="Toggle accessibility mode"
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleFinish}
              >
                🚀 Launch Leo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
