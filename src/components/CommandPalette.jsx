import { useState, useEffect, useRef, useMemo } from 'react'
import Fuse from 'fuse.js'
import {
  LayoutDashboard, Bot, Timer, CalendarDays, FileText,
  Mic, Folder, Search, ArrowRight, Clock, StickyNote, CalendarCheck
} from 'lucide-react'

const COMMANDS = [
  { id: 'go-dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, category: 'Navigate', page: 'dashboard' },
  { id: 'go-ai',        label: 'Go to AI Assistant', icon: Bot,           category: 'Navigate', page: 'ai' },
  { id: 'go-timer',     label: 'Go to Focus Timer',  icon: Timer,         category: 'Navigate', page: 'timer' },
  { id: 'go-schedule',  label: 'Go to Schedule',     icon: CalendarDays,  category: 'Navigate', page: 'schedule' },
  { id: 'go-notes',     label: 'Go to Notes',        icon: FileText,      category: 'Navigate', page: 'notes' },
  { id: 'go-calls',     label: 'Go to Calls',        icon: Mic,           category: 'Navigate', page: 'calls' },
  { id: 'go-files',     label: 'Go to Files',        icon: Folder,        category: 'Navigate', page: 'files' },
  { id: 'new-note',     label: 'New Note',           icon: StickyNote,    category: 'Action',   action: 'new-note' },
  { id: 'new-event',    label: 'New Event',          icon: CalendarCheck, category: 'Action',   action: 'new-event' },
  { id: 'start-timer',  label: 'Start Focus Timer',  icon: Clock,         category: 'Action',   action: 'start-timer' },
  { id: 'ask-leo',      label: 'Ask Leo a question', icon: Bot,           category: 'Action',   action: 'ask-leo' },
]

export default function CommandPalette({ open, onClose, onNavigate, notes = [], events = [] }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  // Fuse search across notes, events, and commands
  const fuseCommands = useMemo(() => new Fuse(COMMANDS, {
    keys: ['label', 'category'],
    threshold: 0.35,
  }), [])

  const fuseNotes = useMemo(() => new Fuse(notes, {
    keys: ['title', 'content'],
    threshold: 0.4,
  }), [notes])

  const fuseEvents = useMemo(() => new Fuse(events, {
    keys: ['name', 'desc'],
    threshold: 0.4,
  }), [events])

  const results = useMemo(() => {
    if (!query.trim()) return COMMANDS.slice(0, 7)
    const cmds = fuseCommands.search(query).map(r => r.item)
    const noteResults = fuseNotes.search(query).slice(0, 3).map(r => ({
      id: `note-${r.item.id}`,
      label: r.item.title,
      icon: StickyNote,
      category: 'Notes',
      page: 'notes',
    }))
    const eventResults = fuseEvents.search(query).slice(0, 3).map(r => ({
      id: `event-${r.item.id}`,
      label: `${r.item.name} — ${r.item.date}`,
      icon: CalendarDays,
      category: 'Events',
      page: 'schedule',
    }))
    return [...cmds, ...noteResults, ...eventResults].slice(0, 10)
  }, [query, fuseCommands, fuseNotes, fuseEvents])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => { setSelected(0) }, [results])

  function execute(item) {
    if (item.page) onNavigate(item.page)
    onClose()
  }

  function handleKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && results[selected]) execute(results[selected])
    if (e.key === 'Escape') onClose()
  }

  if (!open) return null

  const grouped = results.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div
      className="cmd-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div className="cmd-palette anim-scale-in" onClick={e => e.stopPropagation()}>
        {/* Search input */}
        <div className="cmd-input-wrap">
          <Search size={16} className="cmd-search-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            className="cmd-input"
            placeholder="Search pages, notes, events…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            aria-label="Command search"
            autoComplete="off"
          />
          <kbd className="cmd-esc-hint">esc</kbd>
        </div>

        {/* Results */}
        <div className="cmd-results" ref={listRef} role="listbox">
          {results.length === 0 && (
            <div className="cmd-empty">No results for "{query}"</div>
          )}
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="cmd-category">{category}</div>
              {items.map((item, i) => {
                const globalIdx = results.indexOf(item)
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    className={`cmd-item${globalIdx === selected ? ' selected' : ''}`}
                    onClick={() => execute(item)}
                    onMouseEnter={() => setSelected(globalIdx)}
                    role="option"
                    aria-selected={globalIdx === selected}
                  >
                    <div className="cmd-item-left">
                      <Icon size={15} className="cmd-item-icon" aria-hidden="true" />
                      <span>{item.label}</span>
                    </div>
                    <ArrowRight size={13} className="cmd-item-arrow" aria-hidden="true" />
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="cmd-footer">
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>↵</kbd> select</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
