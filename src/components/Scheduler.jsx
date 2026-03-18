import { useState } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const EVENT_COLORS = ['var(--accent)', 'var(--accent-2)', 'var(--accent-3)', 'var(--accent-4)', 'var(--accent-5)']

const SAMPLE_EVENTS = [
  { id: 1, date: '2026-03-12', time: '09:00', name: 'Team Standup', desc: 'Daily sync with engineering team', color: 0 },
  { id: 2, date: '2026-03-12', time: '11:00', name: 'Product Review', desc: 'Q1 roadmap review with stakeholders', color: 1 },
  { id: 3, date: '2026-03-12', time: '14:30', name: 'Client Call', desc: 'Proposal presentation to Acme Corp', color: 2 },
  { id: 4, date: '2026-03-13', time: '10:00', name: '1:1 with Manager', desc: 'Weekly check-in and goal review', color: 3 },
  { id: 5, date: '2026-03-15', time: '09:00', name: 'All-hands Meeting', desc: 'Company-wide quarterly update', color: 4 },
  { id: 6, date: '2026-03-18', time: '13:00', name: 'Workshop', desc: 'Design thinking session', color: 0 },
  { id: 7, date: '2026-03-20', time: '16:00', name: 'Performance Review', desc: 'Annual review with HR', color: 1 },
]

function buildCalendar(year, month) {
  const first = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()
  const cells = []
  for (let i = first - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, thisMonth: false })
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, thisMonth: true })
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, thisMonth: false })
  return cells
}

export default function Scheduler() {
  const today = new Date('2026-03-12')
  const [viewDate, setViewDate] = useState({ year: 2026, month: 2 })
  const [selected, setSelected] = useState(today.toISOString().slice(0, 10))
  const [events, setEvents] = useState(SAMPLE_EVENTS)
  const [form, setForm] = useState({ name: '', time: '09:00', desc: '', color: 0 })
  const [showForm, setShowForm] = useState(false)

  const cells = buildCalendar(viewDate.year, viewDate.month)

  const todayStr = today.toISOString().slice(0, 10)

  function dateStr(day) {
    return `${viewDate.year}-${String(viewDate.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const selectedEvents = events.filter(e => e.date === selected).sort((a, b) => a.time.localeCompare(b.time))

  function prevMonth() {
    setViewDate(d => {
      if (d.month === 0) return { year: d.year - 1, month: 11 }
      return { month: d.month - 1, year: d.year }
    })
  }
  function nextMonth() {
    setViewDate(d => {
      if (d.month === 11) return { year: d.year + 1, month: 0 }
      return { month: d.month + 1, year: d.year }
    })
  }

  function addEvent() {
    if (!form.name.trim()) return
    setEvents(ev => [...ev, { id: Date.now(), date: selected, ...form }])
    setForm({ name: '', time: '09:00', desc: '', color: 0 })
    setShowForm(false)
  }

  function deleteEvent(id) {
    setEvents(ev => ev.filter(e => e.id !== id))
  }

  return (
    <div className="page anim-fade-in">
      <h1 className="page-title">Schedule Planner</h1>
      <p className="page-subtitle">Manage your calendar and upcoming events</p>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Calendar */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <button className="btn btn-ghost btn-sm" onClick={prevMonth} aria-label="Previous month">←</button>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16 }}>
              {MONTHS[viewDate.month]} {viewDate.year}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={nextMonth} aria-label="Next month">→</button>
          </div>

          <div className="cal-grid" role="grid" aria-label="Calendar">
            {DAYS.map(d => <div key={d} className="cal-day-name" role="columnheader">{d}</div>)}
            {cells.map((cell, i) => {
              const ds = cell.thisMonth ? dateStr(cell.day) : ''
              const isToday = ds === todayStr
              const isSel = ds === selected
              const hasEv = events.some(e => e.date === ds)
              return (
                <button
                  key={i}
                  className={`cal-day${isToday ? ' today' : ''}${isSel && !isToday ? ' selected' : ''}${!cell.thisMonth ? ' other-month' : ''}${hasEv && !isToday ? ' has-event' : ''}`}
                  onClick={() => cell.thisMonth && setSelected(ds)}
                  disabled={!cell.thisMonth}
                  role="gridcell"
                  aria-label={cell.thisMonth ? `${MONTHS[viewDate.month]} ${cell.day}${isToday ? ', today' : ''}${hasEv ? ', has events' : ''}` : undefined}
                  aria-selected={isSel}
                  aria-current={isToday ? 'date' : undefined}
                >
                  {cell.day}
                </button>
              )
            })}
          </div>

          <div className="divider" />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} /> Selected
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-2)', display: 'inline-block' }} /> Has events
            </span>
          </div>
        </div>

        {/* Events panel */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18 }}>
                {new Date(selected + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(f => !f)} aria-expanded={showForm}>
              + Add Event
            </button>
          </div>

          {showForm && (
            <div className="card anim-fade-up" style={{ marginBottom: 16 }}>
              <div className="card-title" style={{ marginBottom: 16 }}>New Event</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="input-wrap">
                  <label className="input-label" htmlFor="ev-name">Event Name</label>
                  <input id="ev-name" className="input" placeholder="e.g. Team Meeting" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="input-wrap">
                  <label className="input-label" htmlFor="ev-time">Time</label>
                  <input id="ev-time" type="time" className="input" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
                </div>
              </div>
              <div className="input-wrap" style={{ marginBottom: 12 }}>
                <label className="input-label" htmlFor="ev-desc">Description</label>
                <input id="ev-desc" className="input" placeholder="Optional description" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {EVENT_COLORS.map((c, i) => (
                  <button key={i} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: form.color === i ? '3px solid white' : '3px solid transparent', cursor: 'pointer' }} onClick={() => setForm(f => ({ ...f, color: i }))} aria-label={`Colour ${i + 1}`} aria-pressed={form.color === i} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={addEvent}>Save Event</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {selectedEvents.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.5 }}>📅</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No events for this day. Click "+ Add Event" to schedule one.</div>
            </div>
          ) : (
            <div role="list" aria-label="Events for selected day">
              {selectedEvents.map((ev, i) => (
                <div key={ev.id} className="event-item anim-fade-up" style={{ animationDelay: `${i * 0.07}s` }} role="listitem">
                  <div className="event-time">{ev.time}</div>
                  <div className="event-bar" style={{ background: EVENT_COLORS[ev.color] }} aria-hidden="true" />
                  <div className="event-info">
                    <div className="event-name">{ev.name}</div>
                    {ev.desc && <div className="event-desc">{ev.desc}</div>}
                  </div>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => deleteEvent(ev.id)} aria-label={`Delete event: ${ev.name}`} style={{ fontSize: 16 }}>🗑</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
