import { useState, useRef, useEffect } from 'react'

const DEMO_SUMMARIES = [
  {
    id: 1,
    title: 'Client Onboarding Call – Acme Corp',
    date: 'Mar 10, 2026 · 14:30',
    duration: '42:18',
    summary: 'Discussed project scope, timeline, and deliverables. Client confirmed budget approval and requested weekly status updates. Action items: send contract draft by Friday, schedule kick-off meeting.',
    keyPoints: ['Budget approved — £48,000', 'Weekly updates requested', 'Kick-off meeting to be scheduled', 'Contract draft due Friday'],
    transcript: [
      { speaker: 'You', text: 'Thanks for joining today. Let\'s go through the project scope.' },
      { speaker: 'Client', text: 'Sure, we\'re very excited. The timeline you shared looks good.' },
      { speaker: 'You', text: 'Great. The budget is confirmed on your end?' },
      { speaker: 'Client', text: 'Yes, board approved £48,000 yesterday.' },
    ]
  }
]

const CALL_TIPS = {
  developer: ['Ask about tech stack constraints upfront', 'Take note of API requirements', 'Confirm deployment environment'],
  designer: ['Clarify brand guidelines before design starts', 'Identify primary stakeholders', 'Agree on feedback rounds'],
  marketer: ['Record campaign KPIs mentioned', 'Note budget and timeline', 'Capture audience insights'],
  lawyer: ['Note all parties mentioned', 'Record any agreed deadlines', 'Flag any disputed clauses'],
  default: ['Note key decisions made', 'Record action items and owners', 'Summarise next steps'],
}

export default function CallRecorder({ profile }) {
  const job = profile?.job || 'default'
  const tips = CALL_TIPS[job] || CALL_TIPS.default

  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [calls, setCalls] = useState(DEMO_SUMMARIES)
  const [activeCall, setActiveCall] = useState(null)
  const [transcript, setTranscript] = useState([])
  const [titleDraft, setTitleDraft] = useState('')
  const timerRef = useRef(null)
  const recognitionRef = useRef(null)
  const isRecordingRef = useRef(false)

  function fmt(s) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  function startRec() {
    setRecording(true)
    isRecordingRef.current = true
    setElapsed(0)
    setTranscript([])
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setTranscript([{ speaker: 'System', text: 'Speech Recognition is not supported in your browser (try Chrome/Edge/Safari).' }])
      return
    }

    const rec = new SpeechRecognition()
    rec.continuous = true
    rec.interimResults = false
    rec.lang = 'en-US'

    rec.onresult = (e) => {
      const idx = e.results.length - 1
      const txt = e.results[idx][0].transcript.trim()
      if (txt) {
        setTranscript(t => [...t, { speaker: 'You', text: txt }])
      }
    }

    rec.onend = () => {
      // Keep running if not explicitly stopped
      if (isRecordingRef.current) {
        try { rec.start() } catch (err) {}
      }
    }

    try { rec.start() } catch (err) {}
    recognitionRef.current = rec
  }

  function stopRec() {
    setRecording(false)
    isRecordingRef.current = false
    clearInterval(timerRef.current)
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (err) {}
    }

    // Save new call
    const title = titleDraft.trim() || `Call – ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
    const newCall = {
      id: Date.now(), title,
      date: new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }),
      duration: fmt(elapsed),
      summary: 'Leo is analysing the transcript to generate a summary…',
      keyPoints: ['Recording saved', 'Summary generation in progress'],
      transcript: [...transcript]
    }
    setCalls(c => [newCall, ...c])
    setActiveCall(newCall)
    setTitleDraft('')
    // Simulate AI analysis
    setTimeout(() => {
      setCalls(c => c.map(call => call.id === newCall.id ? {
        ...call,
        summary: `Call recorded for ${elapsed} seconds. Leo successfully transcribed ${transcript.length} phrases. Key action items identified.`,
        keyPoints: transcript.slice(0, 3).map(l => `${l.speaker}: "${l.text.slice(0, 50)}…"`)
      } : call))
    }, 3000)
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  return (
    <div className="page anim-fade-in">
      <h1 className="page-title">Call Recorder & Helper</h1>
      <p className="page-subtitle">Record calls, auto-generate summaries and action items</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Recorder card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div className="card-title">Record a Call</div>
              {recording && (
                <div className="recording-indicator" role="status" aria-live="assertive">
                  <div className="rec-dot" aria-hidden="true" />
                  REC {fmt(elapsed)}
                </div>
              )}
            </div>

            {!recording && (
              <div className="input-wrap" style={{ marginBottom: 14 }}>
                <label className="input-label" htmlFor="call-title">Call Title (optional)</label>
                <input id="call-title" className="input" placeholder="e.g. Client Discovery Call" value={titleDraft} onChange={e => setTitleDraft(e.target.value)} />
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <div className="input-label" style={{ marginBottom: 8 }}>Live Transcript</div>
              <div className="transcript-box" role="log" aria-label="Live transcript" aria-live="polite">
                {transcript.length === 0 && !recording && (
                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Start recording to see your live transcript here…</span>
                )}
                {recording && transcript.length === 0 && (
                  <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>🎙 Listening…</span>
                )}
                {transcript.map((line, i) => (
                  <div key={i} className="transcript-line anim-fade-up">
                    <span className="transcript-speaker">{line.speaker}:</span>
                    <span>{line.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {!recording ? (
                <button className="btn btn-primary" onClick={startRec} aria-label="Start recording">
                  🎙 Start Recording
                </button>
              ) : (
                <button className="btn btn-danger" onClick={stopRec} aria-label="Stop recording">
                  ⏹ Stop & Save
                </button>
              )}
            </div>
          </div>

          {/* Active call detail */}
          {activeCall && (
            <div className="card anim-fade-up">
              <div className="card-header">
                <div className="card-title">{activeCall.title}</div>
                <span className="pill pill-green">✓ Saved</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                {activeCall.date} · {activeCall.duration}
              </div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>🦁 Leo's Summary</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>{activeCall.summary}</p>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>📌 Key Points</div>
              {activeCall.keyPoints.map((kp, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--accent)' }}>•</span> {kp}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved calls + tips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>Past Recordings</div>
            {calls.map((c, i) => (
              <div
                key={c.id}
                className="file-item anim-fade-up"
                style={{ animationDelay: `${i * 0.06}s`, cursor: 'pointer', border: activeCall?.id === c.id ? '1px solid var(--accent)' : undefined }}
                onClick={() => setActiveCall(c)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setActiveCall(c)}
                aria-label={`Open call: ${c.title}`}
              >
                <div className="file-icon" style={{ background: 'rgba(244,63,94,0.12)' }} aria-hidden="true">🎙</div>
                <div className="file-info">
                  <div className="file-name">{c.title}</div>
                  <div className="file-meta">{c.duration} · {c.date}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(34,211,238,0.06))', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div className="card-title" style={{ marginBottom: 10 }}>💡 Tips for {job}s</div>
            {tips.map((t, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent-2)' }}>→</span> {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
