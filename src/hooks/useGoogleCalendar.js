import { useState, useEffect, useCallback } from 'react'
import {
  loadGoogleScript,
  initTokenClient,
  restoreToken,
  signIn,
  signOut as gcalSignOut,
  isSignedIn,
  fetchGoogleEvents,
  createGoogleEvent,
  deleteGoogleEvent,
  GOOGLE_CLIENT_ID,
} from '../services/GoogleCalendarService'

const IS_CONFIGURED = GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE'

export function useGoogleCalendar(localEvents, setLocalEvents) {
  const [gcalReady, setGcalReady] = useState(false)
  const [gcalSignedIn, setGcalSignedIn] = useState(false)
  const [gcalEvents, setGcalEvents] = useState([])
  const [gcalLoading, setGcalLoading] = useState(false)
  const [gcalError, setGcalError] = useState(null)
  const [configured] = useState(IS_CONFIGURED)

  // ─── Init GSI on mount ─────────────────────────────────────────────────
  useEffect(() => {
    if (!configured) return

    loadGoogleScript().then(() => {
      const tokenRestored = restoreToken()
      initTokenClient(
        () => {
          setGcalSignedIn(true)
          setGcalError(null)
        },
        (err) => {
          setGcalError(`Sign-in failed: ${err}`)
          setGcalSignedIn(false)
        }
      )
      if (tokenRestored) {
        setGcalSignedIn(true)
      }
      setGcalReady(true)
    })
  }, [configured])

  // ─── Fetch Google events when signed in ────────────────────────────────
  const refreshGcalEvents = useCallback(async () => {
    if (!gcalSignedIn || !isSignedIn()) return
    setGcalLoading(true)
    setGcalError(null)
    try {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 3, 0)
      const fetched = await fetchGoogleEvents(start, end)
      setGcalEvents(fetched)
    } catch (err) {
      if (err.message === 'TOKEN_EXPIRED') {
        setGcalSignedIn(false)
        setGcalEvents([])
        setGcalError('Session expired. Please sign in again.')
      } else {
        setGcalError(err.message)
      }
    } finally {
      setGcalLoading(false)
    }
  }, [gcalSignedIn])

  useEffect(() => {
    if (gcalSignedIn) refreshGcalEvents()
  }, [gcalSignedIn, refreshGcalEvents])

  // ─── Sign in handler ───────────────────────────────────────────────────
  function handleSignIn() {
    setGcalError(null)
    try {
      signIn()
    } catch (err) {
      setGcalError(err.message)
    }
  }

  // ─── Sign out handler ──────────────────────────────────────────────────
  function handleSignOut() {
    gcalSignOut()
    setGcalSignedIn(false)
    setGcalEvents([])
  }

  // ─── Create event (local + optional Google) ────────────────────────────
  async function addEvent(event, syncToGoogle) {
    const localEvent = { ...event, id: Date.now(), source: 'local' }
    setLocalEvents(ev => [...ev, localEvent])

    if (syncToGoogle && gcalSignedIn) {
      try {
        const googleId = await createGoogleEvent(event)
        // Update the local event with its Google ID for future deletion
        setLocalEvents(ev =>
          ev.map(e => e.id === localEvent.id ? { ...e, googleId, source: 'both' } : e)
        )
        // Refresh Google events
        await refreshGcalEvents()
      } catch (err) {
        setGcalError(`Couldn't sync to Google Calendar: ${err.message}`)
      }
    }
  }

  // ─── Delete event (local + Google if applicable) ───────────────────────
  async function removeEvent(id) {
    const event = [...localEvents, ...gcalEvents].find(e => e.id === id)
    if (!event) return

    if (event.source === 'google' && event.googleId && gcalSignedIn) {
      // Remove from Google only
      try {
        await deleteGoogleEvent(event.googleId)
        setGcalEvents(ev => ev.filter(e => e.id !== id))
        await refreshGcalEvents()
      } catch (err) {
        setGcalError(`Couldn't delete from Google Calendar: ${err.message}`)
      }
    } else {
      // Remove from local (also try Google if it was synced)
      if (event.googleId && gcalSignedIn) {
        try { await deleteGoogleEvent(event.googleId) } catch {}
        await refreshGcalEvents()
      }
      setLocalEvents(ev => ev.filter(e => e.id !== id))
    }
  }

  // ─── Merged events (deduplicated) ─────────────────────────────────────
  const allEvents = [
    ...localEvents,
    // Only include Google events that don't have a local counterpart
    ...gcalEvents.filter(ge => !localEvents.some(le => le.googleId === ge.googleId && le.googleId)),
  ]

  return {
    configured,
    gcalReady,
    gcalSignedIn,
    gcalEvents,
    gcalLoading,
    gcalError,
    allEvents,
    handleSignIn,
    handleSignOut,
    addEvent,
    removeEvent,
    refreshGcalEvents,
  }
}
