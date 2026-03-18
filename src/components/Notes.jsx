import { useState, useRef } from 'react'

const COLORS = ['color-purple', 'color-cyan', 'color-amber', 'color-green']
const COLOR_LABELS = ['Purple', 'Cyan', 'Amber', 'Green']

const SAMPLE_NOTES = [
  { id: 1, title: 'Q1 Goals', content: 'Finalise product roadmap, review team OKRs, prepare board presentation with updated metrics and projections.', color: 'color-purple', tags: ['work', 'planning'], date: 'Mar 10' },
  { id: 2, title: 'Meeting Notes – 11 Mar', content: 'Action items: follow up with design team on new branding guidelines, schedule user research sessions, review A/B test results.', color: 'color-cyan', tags: ['meetings'], date: 'Mar 11' },
  { id: 3, title: 'Ideas Backlog', content: 'AI-powered onboarding flow, dark mode toggle improvements, export to PDF feature, Slack integration for notifications.', color: 'color-amber', tags: ['ideas', 'product'], date: 'Mar 8' },
  { id: 4, title: 'Reading List', content: "Deep Work \u2013 Cal Newport, Atomic Habits, The Manager's Path, Clean Code, Thinking Fast and Slow.", color: 'color-green', tags: ['personal', 'learning'], date: 'Mar 5' },
]

export default function Notes() {
  const [notes, setNotes] = useState(SAMPLE_NOTES)
  const [search, setSearch] = useState('')
  const [activeNote, setActiveNote] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState({ title: '', content: '', color: 'color-purple', tags: [] })
  const [tagInput, setTagInput] = useState('')

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase()) ||
    n.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  function openNote(note) { setActiveNote(note); setIsEditing(false) }
  function startNew() {
    setDraft({ title: '', content: '', color: 'color-purple', tags: [] })
    setActiveNote(null)
    setIsEditing(true)
  }
  function editExisting(note) {
    setDraft({ title: note.title, content: note.content, color: note.color, tags: [...note.tags] })
    setActiveNote(note)
    setIsEditing(true)
  }
  function saveNote() {
    if (!draft.title.trim() && !draft.content.trim()) return
    const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    if (activeNote) {
      setNotes(ns => ns.map(n => n.id === activeNote.id ? { ...n, ...draft, date: now } : n))
      setActiveNote({ ...activeNote, ...draft, date: now })
    } else {
      const newNote = { id: Date.now(), ...draft, date: now }
      setNotes(ns => [newNote, ...ns])
      setActiveNote(newNote)
    }
    setIsEditing(false)
  }
  function deleteNote(id) {
    setNotes(ns => ns.filter(n => n.id !== id))
    setActiveNote(null)
    setIsEditing(false)
  }
  function addTag() {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (t && !draft.tags.includes(t)) setDraft(d => ({ ...d, tags: [...d.tags, t] }))
    setTagInput('')
  }
  function removeTag(tag) { setDraft(d => ({ ...d, tags: d.tags.filter(t => t !== tag) })) }

  return (
    <div className="page anim-fade-in">
      <h1 className="page-title">Note Taker</h1>
      <p className="page-subtitle">Capture ideas, meeting notes, and anything you need</p>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Notes list */}
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input
              className="input"
              placeholder="🔍 Search notes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search notes"
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary btn-sm" onClick={startNew} aria-label="New note">+</button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{filtered.length} note{filtered.length !== 1 ? 's' : ''}</div>
          <div role="list" aria-label="Notes">
            {filtered.map((note, i) => (
              <div
                key={note.id}
                className={`note-card ${note.color} anim-fade-up${activeNote?.id === note.id ? ' selected' : ''}`}
                style={{ animationDelay: `${i * 0.05}s`, marginBottom: 10, border: activeNote?.id === note.id ? '1px solid var(--accent)' : undefined }}
                onClick={() => openNote(note)}
                role="listitem button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && openNote(note)}
                aria-label={`Note: ${note.title}`}
                aria-current={activeNote?.id === note.id}
              >
                <div style={{ paddingLeft: 12 }}>
                  <div className="note-title">{note.title || 'Untitled'}</div>
                  <div className="note-preview">{note.content}</div>
                  <div className="note-meta">
                    <span>📅 {note.date}</span>
                    {note.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note editor / viewer */}
        <div className="card" style={{ minHeight: 500 }}>
          {!activeNote && !isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.4 }}>📝</div>
              <div style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Select a note or create a new one</div>
              <button className="btn btn-primary" onClick={startNew}>+ New Note</button>
            </div>
          ) : isEditing ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: 16 }}>
                  {activeNote ? 'Edit Note' : 'New Note'}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {COLORS.map((c, i) => (
                    <button key={c} style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: c === 'color-purple' ? 'var(--accent)' : c === 'color-cyan' ? 'var(--accent-2)' : c === 'color-amber' ? 'var(--accent-3)' : 'var(--accent-4)',
                      border: draft.color === c ? '3px solid white' : '3px solid transparent', cursor: 'pointer'
                    }} onClick={() => setDraft(d => ({ ...d, color: c }))} aria-label={`${COLOR_LABELS[i]} colour`} aria-pressed={draft.color === c} />
                  ))}
                </div>
              </div>
              <div className="input-wrap" style={{ marginBottom: 12 }}>
                <label className="input-label" htmlFor="note-title">Title</label>
                <input id="note-title" className="input" placeholder="Note title" value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} autoFocus />
              </div>
              <div className="input-wrap" style={{ marginBottom: 12 }}>
                <label className="input-label" htmlFor="note-content">Content</label>
                <textarea id="note-content" className="input" placeholder="Start writing..." style={{ minHeight: 200 }} value={draft.content} onChange={e => setDraft(d => ({ ...d, content: e.target.value }))} />
              </div>
              <div className="input-wrap" style={{ marginBottom: 16 }}>
                <label className="input-label">Tags</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {draft.tags.map(t => (
                    <span key={t} className="tag" style={{ cursor: 'pointer' }} onClick={() => removeTag(t)}>
                      {t} ×
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input" placeholder="Add a tag…" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} aria-label="New tag" style={{ flex: 1 }} />
                  <button className="btn btn-secondary btn-sm" onClick={addTag}>Add</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" onClick={saveNote}>💾 Save Note</button>
                <button className="btn btn-ghost" onClick={() => { setIsEditing(false); if (!activeNote) setActiveNote(null) }}>Cancel</button>
                {activeNote && <button className="btn btn-danger btn-sm" onClick={() => deleteNote(activeNote.id)} style={{ marginLeft: 'auto' }}>🗑 Delete</button>}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{activeNote.title || 'Untitled'}</h2>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last edited {activeNote.date}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => editExisting(activeNote)}>✏️ Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteNote(activeNote.id)}>🗑</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {activeNote.tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{activeNote.content}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
