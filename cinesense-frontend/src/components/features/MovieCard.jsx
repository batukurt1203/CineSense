import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addToWatchlist, removeFromWatchlist, selectWatchlist } from '@store/slices/moviesSlice'
import toast from 'react-hot-toast'
import styles from './MovieCard.module.css'

/**
 * MovieCard – used on recommendation results, search, watchlist pages
 *
 * @param {Object}  movie
 * @param {number}  [matchScore]   – 0–100, shown on recommendation results
 * @param {boolean} [showExplain]  – show "Why this?" button
 * @param {Function} [onExplain]   – callback when "Why this?" clicked
 */
export default function MovieCard({ movie, matchScore, showExplain, onExplain }) {
  const dispatch  = useDispatch()
  const watchlist = useSelector(selectWatchlist)
  const isSaved   = watchlist.some((m) => m.movieId === movie.movieId)

  const handleWatchlist = (e) => {
    e.preventDefault()
    if (isSaved) {
      dispatch(removeFromWatchlist(movie.movieId))
      toast('Removed from watchlist', { icon: '🗑️' })
    } else {
      dispatch(addToWatchlist(movie))
      toast.success('Added to watchlist')
    }
  }

  return (
    <article className={styles.card}>
      <Link to={`/movie/${movie.movieId}`} className={styles.posterLink}>
        <div className={styles.posterWrap}>
          {movie.posterUrl
            ? <img src={movie.posterUrl} alt={movie.title} className={styles.poster} loading="lazy" />
            : <div className={styles.posterFallback}><span>{movie.title[0]}</span></div>
          }

          {matchScore != null && (
            <div className={styles.matchBadge}>
              <span className={styles.matchValue}>{matchScore}%</span>
              <span className={styles.matchLabel}>match</span>
            </div>
          )}

          <div className={styles.overlay}>
            {showExplain && onExplain && (
              <button
                className={styles.explainBtn}
                onClick={(e) => { e.preventDefault(); onExplain(movie) }}
              >
                Why this?
              </button>
            )}
          </div>
        </div>
      </Link>

      <div className={styles.info}>
        <div className={styles.meta}>
          <span className={styles.year}>{movie.year}</span>
          {movie.runtime && <span className={styles.dot}>·</span>}
          {movie.runtime && <span className={styles.runtime}>{movie.runtime} min</span>}
        </div>

        <h3 className={styles.title}>
          <Link to={`/movie/${movie.movieId}`}>{movie.title}</Link>
        </h3>

        {movie.genres?.length > 0 && (
          <div className={styles.genres}>
            {movie.genres.slice(0, 2).map((g) => (
              <span key={g} className={styles.genre}>{g}</span>
            ))}
          </div>
        )}

        <div className={styles.footer}>
          {movie.averageRating != null && (
            <div className={styles.rating}>
              <StarIcon />
              <span>{movie.averageRating.toFixed(1)}</span>
            </div>
          )}
          <button
            className={`${styles.bookmark} ${isSaved ? styles.bookmarkSaved : ''}`}
            onClick={handleWatchlist}
            aria-label={isSaved ? 'Remove from watchlist' : 'Add to watchlist'}
            title={isSaved ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <BookmarkIcon filled={isSaved} />
          </button>
        </div>
      </div>
    </article>
  )
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  )
}

function BookmarkIcon({ filled }) {
  return filled
    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z"/></svg>
    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
}
