import { useState, useRef } from 'react'

const FILE_CATEGORIES = {
  Documents: { emoji: '📄', color: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.25)' },
  Spreadsheets: { emoji: '📊', color: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.25)' },
  Images: { emoji: '🖼️', color: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.25)' },
  Videos: { emoji: '🎬', color: 'rgba(244,63,94,0.15)', border: 'rgba(244,63,94,0.25)' },
  PDFs: { emoji: '📋', color: 'rgba(34,211,238,0.15)', border: 'rgba(34,211,238,0.25)' },
  Archives: { emoji: '📦', color: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.25)' },
  Other: { emoji: '📁', color: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)' },
}

function getCategory(name) {
  const ext = name.split('.').pop().toLowerCase()
  if (['doc', 'docx', 'txt', 'md', 'rtf'].includes(ext)) return 'Documents'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'Spreadsheets'
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return 'Images'
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'Videos'
  if (['pdf'].includes(ext)) return 'PDFs'
  if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext)) return 'Archives'
  return 'Other'
}

const SAMPLE_FILES = [
  { id: 1, name: 'Q1_Strategy_Deck.pdf', size: '4.2 MB', date: 'Mar 11', category: 'PDFs', starred: true, url: null },
  { id: 2, name: 'Team_OKRs_2026.xlsx', size: '890 KB', date: 'Mar 10', category: 'Spreadsheets', starred: false, url: null },
  { id: 3, name: 'Meeting_Notes_March.docx', size: '220 KB', date: 'Mar 10', category: 'Documents', starred: false, url: null },
  { id: 4, name: 'Brand_Guidelines_v3.pdf', size: '12.4 MB', date: 'Mar 8', category: 'PDFs', starred: true, url: null },
  { id: 5, name: 'Product_Roadmap.png', size: '1.8 MB', date: 'Mar 7', category: 'Images', starred: false, url: null },
  { id: 6, name: 'Budget_FY2026.xlsx', size: '540 KB', date: 'Mar 5', category: 'Spreadsheets', starred: false, url: null },
  { id: 7, name: 'Proposal_AcmeCorp.docx', size: '1.1 MB', date: 'Mar 3', category: 'Documents', starred: true, url: null },
  { id: 8, name: 'Promo_Video_Draft.mp4', size: '89 MB', date: 'Feb 28', category: 'Videos', starred: false, url: null },
  { id: 9, name: 'Backup_Archive.zip', size: '234 MB', date: 'Feb 25', category: 'Archives', starred: false, url: null },
]

export default function FileOrganizer() {
  const [files, setFiles] = useState(SAMPLE_FILES)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [view, setView] = useState('list')
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState(null) // { url, name, type }
  const fileInputRef = useRef(null)

  const categories = ['All', ...Object.keys(FILE_CATEGORIES)]
  const shown = files.filter(f => {
    const matchCat = filter === 'All' || f.category === filter
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  function toggleStar(id) { setFiles(fs => fs.map(f => f.id === id ? { ...f, starred: !f.starred } : f)) }

  function deleteFile(id) {
    setFiles(fs => {
      const target = fs.find(f => f.id === id)
      if (target?.url) URL.revokeObjectURL(target.url)
      return fs.filter(f => f.id !== id)
    })
  }

  function openFile(f) {
    if (!f.url) {
      setPreview({ url: null, name: f.name, type: 'demo' })
      return
    }
    if (f.category === 'Images') {
      setPreview({ url: f.url, name: f.name, type: 'image' })
    } else {
      window.open(f.url, '_blank')
    }
  }

  function processFiles(rawFiles) {
    return rawFiles.map(f => ({
      id: Date.now() + Math.random(),
      name: f.name,
      size: f.size < 1024 * 1024
        ? `${(f.size / 1024).toFixed(0)} KB`
        : `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      category: getCategory(f.name),
      starred: false,
      url: URL.createObjectURL(f),
    }))
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    setFiles(fs => [...processFiles(Array.from(e.dataTransfer.files)), ...fs])
  }

  function handleFileInput(e) {
    setFiles(fs => [...processFiles(Array.from(e.target.files)), ...fs])
    e.target.value = ''
  }

  function autoSort() {
    setFiles(fs => [...fs].sort((a, b) => a.category.localeCompare(b.category)))
  }

  const stats = Object.keys(FILE_CATEGORIES).map(cat => ({
    cat, count: files.filter(f => f.category === cat).length,
    ...FILE_CATEGORIES[cat]
  })).filter(s => s.count > 0)

  return (
    <div className="page anim-fade-in">
      <h1 className="page-title">File Organizer</h1>
      <p className="page-subtitle">Sort, search, and manage your work files intelligently</p>

      {/* Preview modal */}
      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
          role="dialog" aria-modal="true" aria-label={`Preview: ${preview.name}`}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)', padding: 24, maxWidth: 680, width: '100%',
              maxHeight: '85vh', display: 'flex', flexDirection: 'column', gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', wordBreak: 'break-word' }}>{preview.name}</span>
              <button
                onClick={() => setPreview(null)}
                style={{ background: 'none', color: 'var(--text-muted)', fontSize: 22, cursor: 'pointer', lineHeight: 1, flexShrink: 0 }}
                aria-label="Close preview"
              >✕</button>
            </div>

            {preview.type === 'image' ? (
              <img
                src={preview.url}
                alt={preview.name}
                style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: 'var(--radius-md)', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>📄</div>
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 15 }}>Demo file — no real content</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  This is a sample placeholder. Upload your own files using the Upload button or drag & drop — then click Open to view them.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category stats */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {stats.map(s => (
          <button
            key={s.cat}
            onClick={() => setFilter(f => f === s.cat ? 'All' : s.cat)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              background: filter === s.cat ? s.color : 'var(--bg-card)',
              border: `1px solid ${filter === s.cat ? s.border : 'var(--border)'}`,
              cursor: 'pointer', transition: 'all 0.2s', color: 'var(--text-primary)',
              fontSize: 13, fontWeight: 500
            }}
            aria-pressed={filter === s.cat}
          >
            <span aria-hidden="true">{s.emoji}</span> {s.cat}
            <span style={{ background: 'var(--bg-secondary)', borderRadius: 99, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{s.count}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          className="input"
          placeholder="🔍 Search files…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search files"
          style={{ flex: 1, minWidth: 180 }}
        />
        <button className="btn btn-secondary btn-sm" onClick={autoSort} aria-label="Auto-sort files by category">
          ✦ Auto-Sort
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => setView(v => v === 'list' ? 'grid' : 'list')} aria-label="Toggle view">
          {view === 'list' ? '⊞ Grid' : '☰ List'}
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => fileInputRef.current.click()} aria-label="Upload files">
          ↑ Upload
        </button>
        <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileInput} aria-hidden="true" />
      </div>

      {/* Dropzone */}
      <div
        className={`dropzone${dragging ? ' dragging' : ''}`}
        style={{ marginBottom: 20, cursor: 'pointer' }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        role="button"
        aria-label="Click or drop files here to upload"
      >
        <div style={{ fontSize: 32, marginBottom: 8 }} aria-hidden="true">{dragging ? '📂' : '📁'}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {dragging ? 'Release to upload' : 'Drag & drop files here, or click to browse'}
        </div>
      </div>

      {/* Files */}
      {shown.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.4 }}>📭</div>
          <div style={{ color: 'var(--text-muted)' }}>No files found. Try a different filter or upload some files.</div>
        </div>
      ) : view === 'list' ? (
        <div role="list" aria-label="Files">
          {shown.map((f, i) => {
            const cat = FILE_CATEGORIES[f.category]
            return (
              <div key={f.id} className="file-item anim-fade-up" style={{ animationDelay: `${i * 0.04}s` }} role="listitem">
                <div className="file-icon" style={{ background: cat.color, border: `1px solid ${cat.border}` }} aria-hidden="true">{cat.emoji}</div>
                <div className="file-info">
                  <div className="file-name">{f.name}</div>
                  <div className="file-meta">
                    {f.category} · {f.size} · {f.date}
                    {!f.url && <span style={{ color: '#475569', marginLeft: 6, fontSize: 10, fontStyle: 'italic' }}>sample</span>}
                  </div>
                </div>
                <div className="file-actions">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => openFile(f)}
                    aria-label={`Open ${f.name}`}
                    style={{ fontSize: 12, color: 'var(--accent-light)' }}
                  >
                    🔍 Open
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => toggleStar(f.id)}
                    aria-label={f.starred ? `Unstar ${f.name}` : `Star ${f.name}`}
                    style={{ fontSize: 16, color: f.starred ? 'var(--accent-3)' : undefined }}
                  >
                    {f.starred ? '★' : '☆'}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => deleteFile(f.id)}
                    aria-label={`Delete ${f.name}`}
                    style={{ fontSize: 14 }}
                  >
                    🗑
                  </button>
                </div>
                {f.starred && (
                  <span style={{ fontSize: 16, color: 'var(--accent-3)', marginLeft: 4 }} aria-label="Starred">★</span>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {shown.map((f, i) => {
            const cat = FILE_CATEGORIES[f.category]
            return (
              <div key={f.id} className="card anim-fade-up" style={{ animationDelay: `${i * 0.04}s`, textAlign: 'center', padding: 16 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }} aria-hidden="true">{cat.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, wordBreak: 'break-word' }}>{f.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.size}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => openFile(f)}
                    aria-label={`Open ${f.name}`}
                    style={{ fontSize: 13 }}
                    title="Open file"
                  >🔍</button>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => toggleStar(f.id)} aria-label={f.starred ? 'Unstar' : 'Star'} style={{ fontSize: 14, color: f.starred ? 'var(--accent-3)' : undefined }}>
                    {f.starred ? '★' : '☆'}
                  </button>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => deleteFile(f.id)} aria-label="Delete" style={{ fontSize: 12 }}>🗑</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
