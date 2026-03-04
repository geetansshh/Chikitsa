/**
 * Hook to set the document title for each page.
 * Appends " | Chikitsa" to the given title.
 */

import { useEffect } from 'react'

const BASE_TITLE = 'Chikitsa'
const SEPARATOR = ' | '

export default function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title}${SEPARATOR}${BASE_TITLE}` : `${BASE_TITLE} — Your Health, Our Priority`
    return () => {
      document.title = `${BASE_TITLE} — Your Health, Our Priority`
    }
  }, [title])
}
