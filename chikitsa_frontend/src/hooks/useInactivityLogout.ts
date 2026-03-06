import { useEffect, useRef } from 'react'

type Params = {
  enabled: boolean
  timeoutMs: number
  onTimeout: () => void
}

const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'click',
]

export default function useInactivityLogout({ enabled, timeoutMs, onTimeout }: Params) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastResetRef = useRef(0)

  const clearTimer = () => {
    if (!timerRef.current) return
    clearTimeout(timerRef.current)
    timerRef.current = null
  }

  const resetTimer = () => {
    const now = Date.now()
    if (now - lastResetRef.current < 1000) return

    lastResetRef.current = now
    clearTimer()
    timerRef.current = setTimeout(() => {
      onTimeout()
    }, timeoutMs)
  }

  useEffect(() => {
    if (!enabled) {
      clearTimer()
      return
    }

    const handleActivity = () => resetTimer()
    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity)
    })

    resetTimer()

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity)
      })
      clearTimer()
    }
  }, [enabled, timeoutMs, onTimeout])
}
