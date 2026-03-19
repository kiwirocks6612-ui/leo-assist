import { useState } from 'react'

const UPCOMING = [
  { name: 'Team Standup', time: '09:00', color: '#818cf8' },
  { name: 'Product Review', time: '11:00', color: '#22d3ee' },
  { name: 'Client Call', time: '14:30', color: '#f59e0b' },
]

const JOB_TIPS = {
  developer: ['Use feature flags for safer deploys', 'Write tests before fixing bugs', 'Document APIs as you build them'],
  designer: ['Prototype early, iterate often', 'Put users first in every decision', 'Consistency builds trust with users'],
  marketer: ['A/B test every major campaign element', 'Track metrics before launching', 'Know your audience deeply'],
  lawyer: ['Document everything, assume nothing', 'Flag ambiguous language immediately', 'Keep client communication clear'],
  doctor: ['Double-check drug interactions', 'Listen actively in patient consults', 'Keep clinical notes detailed'],
  teacher: ['Engage with questions not lectures', 'Celebrate small wins', 'Differentiate for all learners'],
  accountant: ['Reconcile accounts weekly', 'Keep audit trails complete', 'Flag anomalies as soon as found'],
  manager: ['Delegate clearly with deadlines', 'Give feedback in real time', 'Celebrate team achievements'],
  journalist: ['Verify facts with at least two sources', 'Lead with the most newsworthy detail', 'Know your audience'],
  researcher: ['Pre-register your hypotheses', 'Keep methodology transparent', 'Cite rigorously'],
  sales: ['Listen more than you speak', 'Follow up within 24 hours', 'Know your value proposition cold'],
  engineer: ['Safety first on every review', 'Document design assumptions', 'Peer-review critical changes'],
  default: ['Plan your day the night before', 'Take regular breaks to stay sharp', 'Batch similar tasks together'],
}

const GREETING = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const QUOTES = [
  { text: "You always have to believe you can win.", author: "Max Verstappen" },
  { text: "I try to write things that people can relate to.", author: "Tate McRae" },
  { text: "Every person in the team is a link in the chain.", author: "Toto Wolff" },
  { text: "I don't play the odds, I play the man.", author: "Harvey Specter" },
  { text: "Life is this. I like this.", author: "Mike Ross" },
  { text: "I didn't get to where I am by being afraid.", author: "Jessica Pearson" },
  { text: "I don't pay for suits. My suits are on the house or the house burns down.", author: "Thomas Shelby" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "It's fine to celebrate success but it is more important to heed the lessons of failure.", author: "Bill Gates" },
  { text: "I don't believe in happy endings, but I do believe in happy journeys.", author: "George Clooney" },
  { text: "A champion is defined not by their wins but by how they can recover when they fall.", author: "Serena Williams" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "When something is important enough, you do it even if the odds are not in your favor.", author: "Elon Musk" },
  { text: "Don't be afraid of failure. This is the way to succeed.", author: "LeBron James" },
  { text: "Imagination is more important than knowledge.", author: "Albert Einstein" },
]

export default function Dashboard({ profile, onNavigate }) {
  const job = profile?.job || 'default'
  const tips = JOB_TIPS[job] || JOB_TIPS.default
  
  const today = new Date()
  const dayIndex = Math.floor(today.getTime() / 86400000)
  
  const tip = tips[dayIndex % tips.length]
  const quote = QUOTES[dayIndex % QUOTES.length]

  const dateStr = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const QUICK_ACTIONS = [
    { icon: '⏱', label: 'Start Timer', color: '#818cf8', page: 'timer' },
    { icon: '📝', label: 'New Note', color: '#22d3ee', page: 'notes' },
    { icon: '📅', label: 'Add Event', color: '#f59e0b', page: 'schedule' },
    { icon: '🎙', label: 'Record Call', color: '#f43f5e', page: 'calls' },
    { icon: '📁', label: 'Upload File', color: '#10b981', page: 'files' },
    { icon: '💬', label: 'Ask Leo', color: '#c084fc', page: 'ai' },
  ]

  return (
    <div className="page anim-fade-in">
      {/* Hero greeting */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title" style={{ fontSize: 30 }}>
          {GREETING()}, <span className="text-gradient">{profile?.name || 'there'}</span> 👋
        </h1>
        <p className="page-subtitle" style={{ marginBottom: 0, fontSize: 15, fontWeight: 600, background: 'linear-gradient(90deg, #22d3ee, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{dateStr}</p>
      </div>

      {/* Daily Quote & Tip */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.08))',
        border: '1px solid rgba(99,102,241,0.3)',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ fontSize: 32, lineHeight: 1 }}>💭</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--accent)', marginBottom: 6 }}>Quote of the Day</div>
            <div style={{ fontSize: 16, fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 8 }}>"{quote.text}"</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>— {quote.author}</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
          <div style={{ fontSize: 22, lineHeight: 1 }}>🦁</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2 }}>Leo's Tip ({job})</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{tip}</div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="quick-stats" style={{ marginBottom: 24 }}>
        {[
          { label: 'Focus sessions', value: '3', change: '+1 vs yesterday', positive: true },
          { label: 'Notes taken', value: '7', change: '+2 today', positive: true },
          { label: 'Meetings today', value: UPCOMING.length, change: '2 pending', positive: null },
          { label: 'Files organised', value: '9', change: '2 untagged', positive: false },
        ].map((s, i) => (
          <div key={i} className="quick-stat">
            <div className="qs-label">{s.label}</div>
            <div className="qs-value">{s.value}</div>
            <div className={`qs-change${s.positive === false ? ' negative' : ''}`}>
              {s.positive === true ? '↑' : s.positive === false ? '↓' : '→'} {s.change}
            </div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="dashboard-grid">
        {/* Quick actions */}
        <div className="col-8">
          <div className="card">
            <div className="card-header" style={{ marginBottom: 16 }}>
              <div className="card-title">Quick Actions</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {QUICK_ACTIONS.map(a => (
                <button
                  key={a.page}
                  onClick={() => onNavigate(a.page)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                    padding: '18px 10px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: `1px solid ${a.color}33`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = '' }}
                  aria-label={a.label}
                >
                  <span style={{ fontSize: 26, lineHeight: 1, filter: `drop-shadow(0 0 6px ${a.color}88)` }} aria-hidden="true">{a.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: a.color }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming */}
        <div className="col-4">
          <div className="card" style={{ height: '100%' }}>
            <div className="card-header" style={{ marginBottom: 14 }}>
              <div className="card-title">Today's Schedule</div>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('schedule')}>See all →</button>
            </div>
            {UPCOMING.map((ev, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                background: `${ev.color}12`,
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${ev.color}44`,
                marginBottom: 8,
              }}>
                <div style={{ width: 4, height: 36, borderRadius: 99, background: ev.color, flexShrink: 0, boxShadow: `0 0 8px ${ev.color}88` }} aria-hidden="true" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: ev.color }}>{ev.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ev.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent notes */}
        <div className="col-6">
          <div className="card">
            <div className="card-header" style={{ marginBottom: 14 }}>
              <div className="card-title">Recent Notes</div>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('notes')}>See all →</button>
            </div>
            {[
              { title: 'Q1 Goals', preview: 'Finalise product roadmap, review team OKRs…', color: 'var(--accent)', date: 'Mar 10' },
              { title: 'Meeting Notes – 11 Mar', preview: 'Action items: follow up with design team…', color: 'var(--accent-2)', date: 'Mar 11' },
              { title: 'Ideas Backlog', preview: 'AI-powered onboarding flow, dark mode…', color: 'var(--accent-3)', date: 'Mar 8' },
            ].map((n, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '10px 0',
                borderBottom: i < 2 ? '1px solid var(--border)' : undefined
              }}>
                <div style={{ width: 3, borderRadius: 99, background: n.color, flexShrink: 0 }} aria-hidden="true" />
                <div style={{ flex: 1, paddingLeft: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{n.preview}</div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{n.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI suggestions */}
        <div className="col-6">
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(10,11,15,1), rgba(20,22,30,1))' }}>
            <div className="card-header" style={{ marginBottom: 14 }}>
              <div className="card-title">🦁 Leo Suggestions</div>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('ai')}>Open AI →</button>
            </div>
            {[
              `You have a client call at 14:30 — want me to draft talking points?`,
              `3 unread news items relevant to ${job} work this week.`,
              `You haven't taken a short break in a while. Start a 5-minute timer?`,
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '10px 12px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)',
                lineHeight: 1.5, alignItems: 'flex-start'
              }}>
                <span style={{ color: 'var(--accent-light)', fontSize: 16, flexShrink: 0 }}>💡</span>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
