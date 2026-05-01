import { Outlet, Link } from 'react-router-dom'
import styles from './AuthLayout.module.css'

export default function AuthLayout() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.brand}>
        <Link to="/" className={styles.logo}>CineSense</Link>
        <p className={styles.tagline}>Your AI-Powered Movie Matchmaker</p>
      </div>
      <div className={styles.card}>
        <Outlet />
      </div>
    </div>
  )
}
