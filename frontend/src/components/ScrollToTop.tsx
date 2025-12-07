import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop component - automatically scrolls to top when route changes
 * This solves the issue where navigating to a new page preserves the scroll position
 */
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use 'instant' for immediate scroll, 'smooth' for animation
    })
  }, [pathname])

  return null
}

export default ScrollToTop
