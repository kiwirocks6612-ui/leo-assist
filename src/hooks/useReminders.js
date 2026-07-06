import { useEffect, useRef } from 'react'

// Reminder options (minutes before event)
export const REMINDER_OPTIONS = [
  { label: 'None', value: null },
  { label: '5 minutes before', value: 5 },
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '2 hours before', value: 120 },
  { label: '1 day before', value: 1440 },
]

export function useReminders(events) {
  const firedRef = useRef(new Set()) // track which reminders already fired

  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    function checkReminders() {
      if (!('Notification' in window) || Notification.permission !== 'granted') return

      const now = new Date()

      events.forEach(event => {
        if (!event.reminder || !event.date || !event.time) return

        const eventDateTime = new Date(`${event.date}T${event.time}:00`)
        const reminderTime = new Date(eventDateTime.getTime() - event.reminder * 60 * 1000)

        // Fire if we're within 60 seconds of the reminder time and haven't fired yet
        const diffMs = Math.abs(now - reminderTime)
        const key = `${event.id}_${event.reminder}`

        if (diffMs < 60000 && !firedRef.current.has(key) && reminderTime <= now) {
          firedRef.current.add(key)
          const minutesUntil = Math.round((eventDateTime - now) / 60000)
          const timeLabel = minutesUntil >= 60
            ? `${Math.round(minutesUntil / 60)} hour${minutesUntil >= 120 ? 's' : ''}`
            : `${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}`

          new Notification(`🦁 Leo Reminder: ${event.name}`, {
            body: `Starting in ${timeLabel} at ${event.time}${event.desc ? `\n${event.desc}` : ''}`,
            icon: '/leo-icon.svg',
            tag: key,
            requireInteraction: true,
          })
        }
      })
    }

    // Check immediately then every 30 seconds
    checkReminders()
    const interval = setInterval(checkReminders, 30000)
    return () => clearInterval(interval)
  }, [events])
}

// Request notification permission (call on user gesture)
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}
