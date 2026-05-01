import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <span className={styles.logo}>CineSense</span>
          <p className={styles.tagline}>AI-Powered Movie Matchmaker</p>
        </div>
        <nav className={styles.links} aria-label="Footer navigation">
          <Link to="/matchmaker">Matchmaker</Link>
          <Link to="/watch-party">Watch Party</Link>
          <Link to="/search">Browse</Link>
          <a href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Terms</a>
        </nav>
        <p className={styles.copy}>© {new Date().getFullYear()} CineSense. Powered by TMDB.</p>
      </div>
    </footer>
  )
}
