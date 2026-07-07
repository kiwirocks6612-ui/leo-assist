// ─── Google Calendar Service ───────────────────────────────────────────────
// Replace GOOGLE_CLIENT_ID with your own from console.cloud.google.com
// ─────────────────────────────────────────────────────────────────────────────

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE'

const SCOPES = 'https://www.googleapis.com/auth/calendar'
const CALENDAR_API = 'https://www.googleapis.com/calendar/v3'

let tokenClient = null
let accessToken = null

// ─── Load the GSI script ──────────────────────────────────────────────────
export function loadGoogleScript() {
  return new Promise((resolve) => {
    if (window.google?.accounts?.oauth2) return resolve()
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = resolve
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  })
}

// ─── Initialize token client ──────────────────────────────────────────────
export function initTokenClient(onSuccess, onError) {
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPES,
    callback: (response) => {
      if (response.error) {
        onError(response.error)
      } else {
        accessToken = response.access_token
        // Store expiry time (~1hr from now)
        const expiry = Date.now() + (response.expires_in * 1000)
        sessionStorage.setItem('gcal_token', JSON.stringify({ token: accessToken, expiry }))
        onSuccess(response)
      }
    },
  })
}

// ─── Try to restore token from session ───────────────────────────────────
export function restoreToken() {
  try {
    const stored = JSON.parse(sessionStorage.getItem('gcal_token'))
    if (stored && stored.expiry > Date.now()) {
      accessToken = stored.token
      return true
    }
  } catch {}
  return false
}

// ─── Sign in popup ────────────────────────────────────────────────────────
export function signIn() {
  if (!tokenClient) throw new Error('Token client not initialized')
  tokenClient.requestAccessToken({ prompt: '' })
}

// ─── Sign out ─────────────────────────────────────────────────────────────
export function signOut() {
  if (accessToken) {
    window.google?.accounts?.oauth2?.revoke(accessToken)
  }
  accessToken = null
  sessionStorage.removeItem('gcal_token')
}

// ─── Check if signed in ───────────────────────────────────────────────────
export function isSignedIn() {
  return !!accessToken
}

// ─── Fetch events from Google Calendar ───────────────────────────────────
export async function fetchGoogleEvents(timeMin, timeMax) {
  if (!accessToken) throw new Error('Not authenticated')
  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  })
  const res = await fetch(`${CALENDAR_API}/calendars/primary/events?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    if (res.status === 401) {
      accessToken = null
      sessionStorage.removeItem('gcal_token')
      throw new Error('TOKEN_EXPIRED')
    }
    throw new Error(`Calendar API error: ${res.status}`)
  }
  const data = await res.json()
  // Normalize to Leo's event format
  return (data.items || []).map(item => ({
    id: `gcal_${item.id}`,
    googleId: item.id,
    date: (item.start?.dateTime || item.start?.date || '').slice(0, 10),
    time: item.start?.dateTime
      ? new Date(item.start.dateTime).toTimeString().slice(0, 5)
      : '00:00',
    name: item.summary || '(No title)',
    desc: item.description || '',
    color: 1, // cyan for Google Calendar events
    source: 'google',
    htmlLink: item.htmlLink,
    reminder: null,
  }))
}

// ─── Create event in Google Calendar ─────────────────────────────────────
export async function createGoogleEvent(event) {
  if (!accessToken) throw new Error('Not authenticated')

  const startDateTime = `${event.date}T${event.time}:00`
  
  // Default duration: 1 hour. Calculate endDateTime robustly using Date object to handle day/midnight roll-overs.
  const [yr, mo, dy] = event.date.split('-').map(Number)
  const [hr, mn] = event.time.split(':').map(Number)
  const startDateObj = new Date(yr, mo - 1, dy, hr, mn, 0)
  const endDateObj = new Date(startDateObj.getTime() + 60 * 60 * 1000)
  const endYear = endDateObj.getFullYear()
  const endMonth = String(endDateObj.getMonth() + 1).padStart(2, '0')
  const endDateVal = String(endDateObj.getDate()).padStart(2, '0')
  const endHours = String(endDateObj.getHours()).padStart(2, '0')
  const endMinutes = String(endDateObj.getMinutes()).padStart(2, '0')
  const endDateTime = `${endYear}-${endMonth}-${endDateVal}T${endHours}:${endMinutes}:00`

  const body = {
    summary: event.name,
    description: event.desc || '',
    start: { dateTime: startDateTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    end: { dateTime: endDateTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    reminders: event.reminder
      ? { useDefault: false, overrides: [{ method: 'popup', minutes: event.reminder }] }
      : { useDefault: true },
  }

  const res = await fetch(`${CALENDAR_API}/calendars/primary/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Failed to create event: ${res.status}`)
  const data = await res.json()
  return data.id // Google's event ID
}

// ─── Delete event from Google Calendar ───────────────────────────────────
export async function deleteGoogleEvent(googleId) {
  if (!accessToken) throw new Error('Not authenticated')
  const res = await fetch(`${CALENDAR_API}/calendars/primary/events/${googleId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok && res.status !== 410) throw new Error(`Failed to delete event: ${res.status}`)
}
