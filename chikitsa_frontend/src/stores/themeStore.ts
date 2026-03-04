/**
 * Theme store using Zustand.
 * Manages dark/light mode state with localStorage persistence.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

/**
 * Apply the theme class to the <html> element and update
 * the meta theme-color for mobile browsers.
 */
function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// Determine initial theme: localStorage → OS preference → light
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'

  const stored = localStorage.getItem('chikitsa-theme')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      const theme = parsed?.state?.theme
      if (theme === 'dark' || theme === 'light') return theme
    } catch {
      // ignore
    }
  }

  // Respect OS preference
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

// Apply immediately to avoid flash
const initialTheme = getInitialTheme()
applyTheme(initialTheme)

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: initialTheme,

      toggleTheme: () =>
        set((state) => {
          const next = state.theme === 'light' ? 'dark' : 'light'
          applyTheme(next)
          return { theme: next }
        }),

      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
    }),
    {
      name: 'chikitsa-theme',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        // After persist rehydrates, re-apply the theme so the DOM
        // matches the stored value (not the OS-inferred initial value).
        if (state) applyTheme(state.theme)
      },
    }
  )
)
