import { useState, useEffect, useRef } from 'react'

const MODES = [
  { id: 'pomodoro', label: 'Pomodoro', minutes: 25 },
  { id: 'short', label: 'Short Break', minutes: 5 },
  { id: 'long', label: 'Long Break', minutes: 15 },
  { id: 'custom', label: 'Custom', minutes: 0 },
]

const CIRCUMFERENCE = 2 * Math.PI * 96

function fmt(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export default function Timer() {
  const [mode, setMode] = useState('pomodoro')
  const [customMins, setCustomMins] = useState(30)
  const [totalSecs, setTotalSecs] = useState(25 * 60)
  const [secsLeft, setSecsLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [label, setLabel] = useState('Deep Work')
  const intervalRef = useRef(null)

  const pct = secsLeft / totalSecs
  const dash = CIRCUMFERENCE * pct
  const gap = CIRCUMFERENCE - dash

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecsLeft(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            setSessions(n => n + 1)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  function selectMode(m) {
    setMode(m.id)
    setRunning(false)
    const secs = m.id === 'custom' ? customMins * 60 : m.minutes * 60
    setTotalSecs(secs)
    setSecsLeft(secs)
  }

  function resetTimer() {
    setRunning(false)
    const m = MODES.find(m => m.id === mode)
    const secs = mode === 'custom' ? customMins * 60 : m.minutes * 60
    setTotalSecs(secs)
    setSecsLeft(secs)
  }

  function applyCustom() {
    const secs = customMins * 60
    setTotalSecs(secs)
    setSecsLeft(secs)
    setRunning(false)
  }

  const TASK_IDEAS = [
    'Deep Work', 'Email Replies', 'Code Review', 'Brainstorm',
    'Reading', 'Meetings Prep', 'Admin', 'Learning'
  ]

  return (
    <div className="page anim-fade-in">
      <h1 className="page-title">Focus Timer</h1>
      <p className="page-subtitle">Stay in the zone with timed focus sessions</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Main timer */}
        <div className="card">
          <div className="mode-tabs" role="tablist" aria-label="Timer mode">
            {MODES.map(m => (
              <button
                key={m.id}
                className={`mode-tab${mode === m.id ? ' active' : ''}`}
                onClick={() => selectMode(m)}
                role="tab"
                aria-selected={mode === m.id}
              >
                {m.label}
              </button>
            ))}
          </div>

          {mode === 'custom' && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
              <input
                type="number" min="1" max="120"
                className="input"
                value={customMins}
                onChange={e => setCustomMins(Number(e.target.value))}
                aria-label="Custom duration in minutes"
                style={{ width: 80 }}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>minutes</span>
              <button className="btn btn-secondary btn-sm" onClick={applyCustom}>Set</button>
            </div>
          )}

          {/* SVG Ring */}
          <div className="timer-ring-wrap" role="timer" aria-label={`${fmt(secsLeft)} remaining`}>
            <svg className="timer-ring" width="220" height="220" viewBox="0 0 220 220" aria-hidden="true">
              <defs>
                <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              <circle className="timer-ring-bg" cx="110" cy="110" r="96" />
              <circle
                className="timer-ring-fg"
                cx="110" cy="110" r="96"
                strokeDasharray={`${dash} ${gap}`}
              />
            </svg>
            <div className="timer-center">
              <div className="timer-display" style={{ fontSize: 52 }}>{fmt(secsLeft)}</div>
              <div className="timer-label">{label}</div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
            <button
              className="btn btn-primary"
              onClick={() => setRunning(r => !r)}
              aria-label={running ? 'Pause timer' : 'Start timer'}
              style={{ minWidth: 120, justifyContent: 'center', fontSize: 16 }}
            >
              {running ? '⏸ Pause' : '▶ Start'}
            </button>
            <button className="btn btn-secondary btn-icon" onClick={resetTimer} aria-label="Reset timer">↺</button>
          </div>

          {/* Labels */}
          <div>
            <div className="input-label" style={{ marginBottom: 8 }}>Session Label</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {TASK_IDEAS.map(t => (
                <button
                  key={t}
                  onClick={() => setLabel(t)}
                  className={`tag`}
                  style={{
                    cursor: 'pointer',
                    borderColor: label === t ? 'var(--accent)' : undefined,
                    color: label === t ? 'var(--accent-light)' : undefined,
                    background: label === t ? 'rgba(99,102,241,0.15)' : undefined,
                    transition: 'all 0.15s'
                  }}
                  aria-pressed={label === t}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Today's Sessions</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'Completed', value: sessions, color: 'var(--accent-4)' },
                { label: 'Focus Time', value: `${sessions * (MODES.find(m => m.id === mode)?.minutes || customMins)}m`, color: 'var(--accent)' },
                { label: 'Streak', value: `${sessions > 0 ? sessions : 0} 🔥`, color: 'var(--accent-3)' },
              ].map(s => (
                <div key={s.label} className="quick-stat" style={{ minWidth: '30%' }}>
                  <div className="qs-label">{s.label}</div>
                  <div className="qs-value" style={{ color: s.color, fontSize: 28 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>Pomodoro Tips</div>
            {[
              ['🎯', '25 min focus, 5 min break cycle is scientifically proven'],
              ['📵', 'Put your phone on Do Not Disturb during sessions'],
              ['💧', 'Stay hydrated — drink water during breaks'],
              ['🧘', 'Use long breaks (15 min) after every 4 sessions'],
            ].map(([icon, tip], i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 13, color: 'var(--text-secondary)', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18 }} aria-hidden="true">{icon}</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.08))', border: '1px solid rgba(99,102,241,0.25)' }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>🐦‍⬛ Corvus says:</strong>
              Keep going! Deep work sessions are the key to high-impact output. You're doing great.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
