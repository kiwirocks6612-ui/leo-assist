import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

const SAMPLE_NOTES = [
  { id: 1, title: 'Q1 Goals', content: 'Finalise product roadmap, review team OKRs, prepare board presentation with updated metrics and projections.', color: 'color-purple', tags: ['work', 'planning'], date: 'Mar 10' },
  { id: 2, title: 'Meeting Notes – 11 Mar', content: 'Action items: follow up with design team on new branding guidelines, schedule user research sessions, review A/B test results.', color: 'color-cyan', tags: ['meetings'], date: 'Mar 11' },
  { id: 3, title: 'Ideas Backlog', content: 'AI-powered onboarding flow, dark mode toggle improvements, export to PDF feature, Slack integration for notifications.', color: 'color-amber', tags: ['ideas', 'product'], date: 'Mar 8' },
  { id: 4, title: 'Reading List', content: "Deep Work – Cal Newport, Atomic Habits, The Manager's Path, Clean Code, Thinking Fast and Slow.", color: 'color-green', tags: ['personal', 'learning'], date: 'Mar 5' },
];

const SAMPLE_EVENTS = [
  { id: 1, date: '2026-03-12', time: '09:00', name: 'Team Standup', desc: 'Daily sync with engineering team', color: 0 },
  { id: 2, date: '2026-03-12', time: '11:00', name: 'Product Review', desc: 'Q1 roadmap review with stakeholders', color: 1 },
  { id: 3, date: '2026-03-12', time: '14:30', name: 'Client Call', desc: 'Proposal presentation to Acme Corp', color: 2 },
  { id: 4, date: '2026-03-13', time: '10:00', name: '1:1 with Manager', desc: 'Weekly check-in and goal review', color: 3 },
  { id: 5, date: '2026-03-15', time: '09:00', name: 'All-hands Meeting', desc: 'Company-wide quarterly update', color: 4 },
  { id: 6, date: '2026-03-18', time: '13:00', name: 'Workshop', desc: 'Design thinking session', color: 0 },
  { id: 7, date: '2026-03-20', time: '16:00', name: 'Performance Review', desc: 'Annual review with HR', color: 1 },
];

export function AppContextProvider({ children }) {
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('leo_notes');
      return saved ? JSON.parse(saved) : SAMPLE_NOTES;
    } catch { return SAMPLE_NOTES; }
  });

  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('leo_events');
      return saved ? JSON.parse(saved) : SAMPLE_EVENTS;
    } catch { return SAMPLE_EVENTS; }
  });

  useEffect(() => {
    localStorage.setItem('leo_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('leo_events', JSON.stringify(events));
  }, [events]);

  return (
    <AppContext.Provider value={{ notes, setNotes, events, setEvents }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppContextProvider');
  return ctx;
}
