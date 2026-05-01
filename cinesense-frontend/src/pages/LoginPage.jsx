import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, clearError, selectAuthLoading, selectAuthError, selectIsAuthenticated } from '@store/slices/authSlice'
import { authService } from '@services/authService'
import Button from '@components/common/Button'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const dispatch        = useDispatch()
  const navigate        = useNavigate()
  const location        = useLocation()
  const isLoading       = useSelector(selectAuthLoading)
  const authError       = useSelector(selectAuthError)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const from = location.state?.from?.pathname || '/'

  const [form, setForm]                 = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors]   = useState({})
  const [touched, setTouched]           = useState({})

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated, navigate, from])

  useEffect(() => () => dispatch(clearError()), [dispatch])

  const validate = (name, value) => {
    if (name === 'email') {
      if (!value) return 'E-posta adresi gerekli'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Geçerli bir e-posta adresi girin'
    }
    if (name === 'password') {
      if (!value) return 'Şifre gerekli'
      if (value.length < 6) return 'Şifre en az 6 karakter olmalı'
    }
    return ''
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (touched[name]) setFieldErrors(prev => ({ ...prev, [name]: validate(name, value) }))
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    setFieldErrors(prev => ({ ...prev, [name]: validate(name, value) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    const errors = {
      email:    validate('email',    form.email),
      password: validate('password', form.password),
    }
    setFieldErrors(errors)
    if (Object.values(errors).some(Boolean)) return
    dispatch(loginUser(form))
  }

  const handleOAuth = (provider) => {
    window.location.href = authService.getOAuthUrl(provider)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Hoş Geldiniz</h1>
        <p className={styles.subtitle}>Hesabınıza giriş yapın</p>
      </div>

      <div className={styles.oauthGroup}>
        <button type="button" className={styles.oauthBtn} onClick={() => handleOAuth('google')} disabled={isLoading}>
          <GoogleIcon />
          Google ile devam et
        </button>
        <button type="button" className={styles.oauthBtn} onClick={() => handleOAuth('github')} disabled={isLoading}>
          <GithubIcon />
          GitHub ile devam et
        </button>
      </div>

      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>ya da e-posta ile</span>
        <span className={styles.dividerLine} />
      </div>

      {authError && (
        <div className={styles.errorBanner} role="alert">
          <ErrorIcon />
          <span>{authError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={[
          styles.field,
          fieldErrors.email && touched.email ? styles.fieldError : '',
          !fieldErrors.email && touched.email && form.email ? styles.fieldSuccess : '',
        ].join(' ')}>
          <label htmlFor="email" className={styles.label}>E-posta</label>
          <div className={styles.inputWrapper}>
            <MailIcon className={styles.inputIcon} />
            <input
              id="email" type="email" name="email"
              value={form.email} onChange={handleChange} onBlur={handleBlur}
              placeholder="ornek@email.com" className={styles.input}
              autoComplete="email" disabled={isLoading}
            />
            {!fieldErrors.email && touched.email && form.email && <CheckIcon className={styles.inputStatus} />}
          </div>
          {fieldErrors.email && touched.email && <p className={styles.fieldErrorMsg}>{fieldErrors.email}</p>}
        </div>

        <div className={[styles.field, fieldErrors.password && touched.password ? styles.fieldError : ''].join(' ')}>
          <div className={styles.labelRow}>
            <label htmlFor="password" className={styles.label}>Şifre</label>
            <Link to="/forgot-password" className={styles.forgotLink}>Şifremi unuttum</Link>
          </div>
          <div className={styles.inputWrapper}>
            <LockIcon className={styles.inputIcon} />
            <input
              id="password" type={showPassword ? 'text' : 'password'} name="password"
              value={form.password} onChange={handleChange} onBlur={handleBlur}
              placeholder="••••••••" className={styles.input}
              autoComplete="current-password" disabled={isLoading}
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(v => !v)}
              tabIndex={-1} aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}>
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {fieldErrors.password && touched.password && <p className={styles.fieldErrorMsg}>{fieldErrors.password}</p>}
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading}>
          Giriş Yap
        </Button>
      </form>

      <p className={styles.switchText}>
        Hesabınız yok mu?{' '}
        <Link to="/register" className={styles.switchLink}>Kayıt olun</Link>
      </p>
    </div>
  )
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
)

const MailIcon = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/>
  </svg>
)

const LockIcon = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
)

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9.88 9.88a3 3 0 104.24 4.24M10.73 5.08A10.43 10.43 0 0112 5c7 0 10 7 10 7a13.16 13.16 0 01-1.67 2.68M6.61 6.61A13.526 13.526 0 002 12s3 7 10 7a9.74 9.74 0 005.39-1.61M2 2l20 20"/>
  </svg>
)

const CheckIcon = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const ErrorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
