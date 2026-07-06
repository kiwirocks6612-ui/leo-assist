import { useState } from 'react'
import { useAppContext } from '../AppContext'
import { useGoogleCalendar } from '../hooks/useGoogleCalendar'
import { useReminders, REMINDER_OPTIONS, requestNotificationPermission } from '../hooks/useReminders'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const EVENT_COLORS = ['var(--accent)', 'var(--accent-2)', 'var(--accent-3)', 'var(--accent-4)', 'var(--accent-5)']

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
  const today = new Date()
  const [viewDate, setViewDate] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [selected, setSelected] = useState(today.toISOString().slice(0, 10))
  const { events: localEvents, setEvents: setLocalEvents } = useAppContext()
  const [form, setForm] = useState({ name: '', time: '09:00', desc: '', color: 0, reminder: null, syncToGoogle: false })
  const [showForm, setShowForm] = useState(false)
  const [notifGranted, setNotifGranted] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  )

  const {
    configured,
    gcalReady,
    gcalSignedIn,
    gcalLoading,
    gcalError,
    allEvents,
    handleSignIn,
    handleSignOut,
    addEvent,
    removeEvent,
    refreshGcalEvents,
  } = useGoogleCalendar(localEvents, setLocalEvents)

  // Activate browser reminders
  useReminders(allEvents)

  const cells = buildCalendar(viewDate.year, viewDate.month)
  const todayStr = today.toISOString().slice(0, 10)

  function dateStr(day) {
    return `${viewDate.year}-${String(viewDate.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const selectedEvents = allEvents.filter(e => e.date === selected).sort((a, b) => a.time.localeCompare(b.time))

  function prevMonth() {
    setViewDate(d => d.month === 0 ? { year: d.year - 1, month: 11 } : { month: d.month - 1, year: d.year })
  }
  function nextMonth() {
    setViewDate(d => d.month === 11 ? { year: d.year + 1, month: 0 } : { month: d.month + 1, year: d.year })
  }

  async function handleAddEvent() {
    if (!form.name.trim()) return
    await addEvent({ ...form, date: selected }, form.syncToGoogle)
    setForm({ name: '', time: '09:00', desc: '', color: 0, reminder: null, syncToGoogle: false })
    setShowForm(false)
  }

  async function handleEnableNotifications() {
    const granted = await requestNotificationPermission()
    setNotifGranted(granted)
  }

  return (
    <div className="page anim-fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Schedule Planner</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Manage your calendar and upcoming events</p>
        </div>

        {/* Google Calendar Connection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!notifGranted && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleEnableNotifications}
              title="Enable browser notifications for event reminders"
            >
              🔔 Enable Reminders
            </button>
          )}

          {!configured ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 14px',
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 'var(--radius-md)',
              fontSize: 12, color: 'var(--accent-3)',
            }}>
              <span>⚙️</span>
              <span>Add <code>VITE_GOOGLE_CLIENT_ID</code> to .env to enable Google Calendar</span>
            </div>
          ) : !gcalSignedIn ? (
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleSignIn}
              disabled={!gcalReady}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Connect Google Calendar
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 'var(--radius-md)',
                fontSize: 12, color: 'var(--accent-4)',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-4)', display: 'inline-block' }} />
                Synced with Google
                {gcalLoading && <span style={{ marginLeft: 4 }}>⟳</span>}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={refreshGcalEvents} title="Refresh Google Calendar events" aria-label="Refresh">
                ↻
              </button>
              <button className="btn btn-ghost btn-sm" onClick={handleSignOut} style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error banner */}
      {gcalError && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between',
          padding: '10px 16px', marginBottom: 16,
          background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
          borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--accent-5)',
        }}>
          <span>⚠️ {gcalError}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => {}} style={{ fontSize: 16, lineHeight: 1 }}>×</button>
        </div>
      )}

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
              const hasEv = allEvents.some(e => e.date === ds)
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
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} /> Today
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-2)', display: 'inline-block' }} /> Has events
            </span>
            {gcalSignedIn && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-4)', display: 'inline-block' }} /> Google
              </span>
            )}
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

          {/* Add Event Form */}
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

              {/* Reminder selector */}
              <div className="input-wrap" style={{ marginBottom: 12 }}>
                <label className="input-label" htmlFor="ev-reminder">
                  🔔 Reminder
                  {!notifGranted && (
                    <button
                      onClick={handleEnableNotifications}
                      style={{ marginLeft: 8, background: 'none', border: 'none', color: 'var(--accent)', fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      (Enable notifications)
                    </button>
                  )}
                </label>
                <select
                  id="ev-reminder"
                  className="input"
                  value={form.reminder ?? ''}
                  onChange={e => setForm(f => ({ ...f, reminder: e.target.value === '' ? null : Number(e.target.value) }))}
                  style={{ appearance: 'none' }}
                >
                  {REMINDER_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value ?? ''}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Color picker */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {EVENT_COLORS.map((c, i) => (
                  <button key={i} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: form.color === i ? '3px solid white' : '3px solid transparent', cursor: 'pointer' }} onClick={() => setForm(f => ({ ...f, color: i }))} aria-label={`Colour ${i + 1}`} aria-pressed={form.color === i} />
                ))}
              </div>

              {/* Google Calendar sync toggle */}
              {gcalSignedIn && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={form.syncToGoogle}
                    onChange={e => setForm(f => ({ ...f, syncToGoogle: e.target.checked }))}
                    style={{ accentColor: 'var(--accent)', width: 16, height: 16 }}
                  />
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: 'middle', marginRight: 4 }}>
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.09 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Also save to Google Calendar
                  </span>
                </label>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={handleAddEvent}>Save Event</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Event list */}
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
                  <div className="event-bar" style={{ background: EVENT_COLORS[ev.color ?? 1] }} aria-hidden="true" />
                  <div className="event-info" style={{ flex: 1 }}>
                    <div className="event-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {ev.name}
                      {/* Source badges */}
                      {ev.source === 'google' && (
                        <span title="From Google Calendar" style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                        </span>
                      )}
                      {ev.reminder && <span title={`Reminder: ${REMINDER_OPTIONS.find(o => o.value === ev.reminder)?.label}`} style={{ fontSize: 11 }}>🔔</span>}
                    </div>
                    {ev.desc && <div className="event-desc">{ev.desc}</div>}
                    {ev.htmlLink && (
                      <a href={ev.htmlLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--accent)', marginTop: 2, display: 'inline-block' }}>
                        Open in Google Calendar ↗
                      </a>
                    )}
                  </div>
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => removeEvent(ev.id)}
                    aria-label={`Delete event: ${ev.name}`}
                    style={{ fontSize: 16 }}
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
