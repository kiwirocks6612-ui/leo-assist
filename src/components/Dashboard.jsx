import { useState } from 'react'
import { useAppContext } from '../AppContext'

const EVENT_COLORS_HEX = ['#818cf8', '#22d3ee', '#f59e0b', '#f43f5e', '#10b981']

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
  { text: "Whoever said that money doesn't buy happiness didn't know where to shop.", author: "Blair Waldorf" },
  { text: "Destiny is for losers. It's just a stupid excuse to wait for things to happen instead of making them happen.", author: "Blair Waldorf" },
  { text: "Fashion is the most powerful art there is. It shows the world who we are and who we'd like to be.", author: "Blair Waldorf" },
  { text: "If you no longer go for a gap that exists, you are no longer a racing driver.", author: "Ayrton Senna" },
  { text: "To achieve anything in this game, you must be prepare to dabble in the boundary of disaster.", author: "Stirling Moss" },
  { text: "I am an artist. The track is my canvas, and the car is my brush.", author: "Graham Hill" },
  { text: "I try to write things that people can relate to.", author: "Tate McRae" },
  { text: "Every person in the team is a link in the chain.", author: "Toto Wolff" },
  { text: "I don't play the odds, I play the man.", author: "Harvey Specter" },
  { text: "Life is this. I like this.", author: "Harvey Specter" },
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
  { text: "Friends don't lie.", author: "Eleven" },
  { text: "Mornings are for coffee and contemplation.", author: "Chief Hopper" },
  { text: "Nobody normal ever accomplished anything meaningful in this world.", author: "Jonathan Byers" },
  { text: "Always the babysitter. Always the goddamn babysitter!", author: "Steve Harrington" },
  { text: "It's Fabergé Organics. Use the shampoo and conditioner, and when your hair's damp, not wet, okay? When it's damp, you do four puffs of the Farrah Fawcett spray.", author: "Steve Harrington" },
  { text: "Yeah, it's me, don't cream your pants.", author: "Steve Harrington" },
]

export default function Dashboard({ profile, onNavigate }) {
  const job = profile?.job || 'default'
  const { notes, events } = useAppContext()
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayEvents = events.filter(e => e.date === todayStr).sort((a, b) => a.time.localeCompare(b.time))
  
  const knownMatch = Object.keys(JOB_TIPS).find(k => job.toLowerCase().includes(k))
  const isCustom = !knownMatch && job !== 'default'
  
  const baseTips = knownMatch ? JOB_TIPS[knownMatch] : JOB_TIPS.default
  
  const tips = isCustom ? [
    `Stay updated with the latest tools and practices in your field as a ${job}.`,
    `Network with other ${job} professionals to share insights.`,
    `Take regular breaks to maintain focus on your complex tasks.`
  ] : baseTips
  
  const today = new Date()
  const dayIndex = Math.floor(today.getTime() / 86400000)
  
  const [quoteOffset, setQuoteOffset] = useState(0)
  const [tipOffset, setTipOffset] = useState(0)

  const tip = tips[(dayIndex + tipOffset) % tips.length]
  const quote = QUOTES[(dayIndex + quoteOffset) % QUOTES.length]

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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--accent)' }}>Quote of the Day</div>
              <button onClick={() => setQuoteOffset(o => o + 1)} className="btn-ghost" style={{ padding: '2px 6px', borderRadius: 4, fontSize: 13 }} title="Show next quote">🔄</button>
            </div>
            <div style={{ fontSize: 16, fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 8 }}>"{quote.text}"</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>— {quote.author}</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
          <div style={{ fontSize: 22, lineHeight: 1 }}>🦁</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
              <div style={{ fontWeight: 700, fontSize: 12 }}>Leo's Tip ({job})</div>
              <button onClick={() => setTipOffset(o => o + 1)} className="btn-ghost" style={{ padding: '2px 6px', borderRadius: 4, fontSize: 12 }} title="Show next tip">🔄</button>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{tip}</div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="quick-stats" style={{ marginBottom: 24 }}>
        {[
          { label: 'Notes saved', value: notes.length, change: 'across all topics', positive: true },
          { label: 'Events today', value: todayEvents.length, change: todayEvents.length > 0 ? `next: ${todayEvents[0]?.time}` : 'all clear', positive: todayEvents.length > 0 ? null : true },
          { label: 'Total events', value: events.length, change: 'in your calendar', positive: null },
          { label: 'Ask Leo', value: '∞', change: 'always available', positive: true },
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
            {todayEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.5 }}>🎉</div>
                No events today — enjoy the free time!
              </div>
            ) : todayEvents.slice(0, 4).map((ev, i) => {
              const color = EVENT_COLORS_HEX[ev.color % EVENT_COLORS_HEX.length]
              return (
                <div key={ev.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px',
                  background: `${color}12`,
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${color}44`,
                  marginBottom: 8,
                }}>
                  <div style={{ width: 4, height: 36, borderRadius: 99, background: color, flexShrink: 0, boxShadow: `0 0 8px ${color}88` }} aria-hidden="true" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color }}>{ev.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ev.time}{ev.desc ? ` · ${ev.desc.slice(0, 30)}` : ''}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent notes */}
        <div className="col-6">
          <div className="card">
            <div className="card-header" style={{ marginBottom: 14 }}>
              <div className="card-title">Recent Notes</div>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('notes')}>See all →</button>
            </div>
            {notes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.5 }}>📝</div>
                No notes yet — create your first one!
              </div>
            ) : notes.slice(0, 3).map((n, i) => {
              const colorMap = { 'color-purple': 'var(--accent)', 'color-cyan': 'var(--accent-2)', 'color-amber': 'var(--accent-3)', 'color-green': 'var(--accent-4)' }
              const color = colorMap[n.color] || 'var(--accent)'
              return (
                <div key={n.id} style={{
                  display: 'flex', gap: 10, padding: '10px 0',
                  borderBottom: i < 2 ? '1px solid var(--border)' : undefined,
                  cursor: 'pointer'
                }} onClick={() => onNavigate('notes')}>
                  <div style={{ width: 3, borderRadius: 99, background: color, flexShrink: 0 }} aria-hidden="true" />
                  <div style={{ flex: 1, paddingLeft: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{n.title || 'Untitled'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{n.content?.slice(0, 60)}{n.content?.length > 60 ? '…' : ''}</div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{n.date}</span>
                </div>
              )
            })}
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
