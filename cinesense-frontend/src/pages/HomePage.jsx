// HomePage.jsx
import { Link } from 'react-router-dom'
import styles from './HomePage.module.css'

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <p className={styles.eyebrow}>AI-Powered Movie Matchmaker</p>
          <h1 className={styles.headline}>
            Find Your Next<br />
            <em>Perfect Film</em>
          </h1>
          <p className={styles.subline}>
            Tell us how you feel. We'll find the exact movie for this moment.
          </p>
          <div className={styles.heroCta}>
            <Link to="/matchmaker" className={styles.ctaPrimary}>Start Matchmaker</Link>
            <Link to="/watch-party" className={styles.ctaSecondary}>Watch Party →</Link>
          </div>
        </div>
        <div className={styles.heroBg} aria-hidden="true" />
      </section>
    </div>
  )
}
