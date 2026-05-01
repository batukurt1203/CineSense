import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { selectIsAuthenticated, selectUser, logoutUser } from '@store/slices/authSlice'
import { selectMobileMenu, toggleMobileMenu, closeMobileMenu } from '@store/slices/uiSlice'
import toast from 'react-hot-toast'
import styles from './Navbar.module.css'

export default function Navbar() {
  const dispatch       = useDispatch()
  const navigate       = useNavigate()
  const isAuth         = useSelector(selectIsAuthenticated)
  const user           = useSelector(selectUser)
  const mobileMenuOpen = useSelector(selectMobileMenu)

  const handleLogout = async () => {
    await dispatch(logoutUser())
    dispatch(closeMobileMenu())
    toast.success('Signed out')
    navigate('/')
  }

  return (
    <header className={styles.header}>
      <nav className={`container ${styles.nav}`}>
        {/* Logo */}
        <Link to="/" className={styles.logo} onClick={() => dispatch(closeMobileMenu())}>
          <span className={styles.logoText}>CineSense</span>
        </Link>

        {/* Desktop Nav */}
        <ul className={styles.links}>
          <li><NavLink to="/matchmaker" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>Matchmaker</NavLink></li>
          <li><NavLink to="/watch-party" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>Watch Party</NavLink></li>
          <li><NavLink to="/search" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>Browse</NavLink></li>
          {isAuth && (
            <li><NavLink to="/watchlist" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>Watchlist</NavLink></li>
          )}
        </ul>

        {/* Desktop Auth */}
        <div className={styles.auth}>
          {isAuth ? (
            <>
              <Link to="/profile" className={styles.avatar}>
                {user?.avatarUrl
                  ? <img src={user.avatarUrl} alt={user.displayName} />
                  : <span>{user?.displayName?.[0]?.toUpperCase() || 'U'}</span>
                }
              </Link>
              <button onClick={handleLogout} className={styles.btnOutline}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login"    className={styles.btnGhost}>Sign In</Link>
              <Link to="/register" className={styles.btnGold}>Get Started</Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => dispatch(toggleMobileMenu())}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className={mobileMenuOpen ? styles.barOpen1 : styles.bar} />
          <span className={mobileMenuOpen ? styles.barOpen2 : styles.bar} />
          <span className={mobileMenuOpen ? styles.barOpen3 : styles.bar} />
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <ul className={styles.mobileLinks}>
          <li><NavLink to="/matchmaker"  onClick={() => dispatch(closeMobileMenu())}>Matchmaker</NavLink></li>
          <li><NavLink to="/watch-party" onClick={() => dispatch(closeMobileMenu())}>Watch Party</NavLink></li>
          <li><NavLink to="/search"      onClick={() => dispatch(closeMobileMenu())}>Browse</NavLink></li>
          {isAuth && <li><NavLink to="/watchlist" onClick={() => dispatch(closeMobileMenu())}>Watchlist</NavLink></li>}
          {isAuth
            ? <li><button onClick={handleLogout}>Sign Out</button></li>
            : <>
                <li><Link to="/login"    onClick={() => dispatch(closeMobileMenu())}>Sign In</Link></li>
                <li><Link to="/register" onClick={() => dispatch(closeMobileMenu())}>Get Started</Link></li>
              </>
          }
        </ul>
      </div>
    </header>
  )
}
