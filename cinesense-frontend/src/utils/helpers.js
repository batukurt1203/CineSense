/**
 * Format runtime from minutes to "2h 15m"
 */
export function formatRuntime(minutes) {
  if (!minutes) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}`.trim() : `${m}m`
}

/**
 * Truncate string to maxLength with ellipsis
 */
export function truncate(str, maxLength = 120) {
  if (!str || str.length <= maxLength) return str
  return str.slice(0, maxLength).trim() + '…'
}

/**
 * Get TMDB image URL
 */
export function getTmdbImage(path, size = 'w500') {
  if (!path) return null
  return `https://image.tmdb.org/t/p/${size}${path}`
}

/**
 * Format a date string to "Mar 2024"
 */
export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

/**
 * Debounce function
 */
export function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Clamp a number between min and max
 */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

/**
 * Generate a random 6-char Watch Party code (client-side preview only; server issues real code)
 */
export function generatePartyCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}
