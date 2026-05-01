import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser, clearError, selectAuthLoading, selectAuthError, selectIsAuthenticated } from '@store/slices/authSlice'
import { authService } from '@services/authService'
import Button from '@components/common/Button'
import styles from './RegisterPage.module.css'

const STRENGTH_LEVELS = [
  { label: 'Çok zayıf', color: '#ef5350' },
  { label: 'Zayıf',     color: '#ff8f00' },
  { label: 'Orta',      color: '#fdd835' },
  { label: 'Güçlü',     color: '#66bb6a' },
  { label: 'Çok güçlü', color: '#2ea84a' },
]

function getStrength(password) {
  if (!password) return -1
  let score = 0
  if (password.length >= 8)  score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return Math.min(score, 4)
}

export default function RegisterPage() {
  const dispatch        = useDispatch()
  const navigate        = useNavigate()
  const isLoading       = useSelector(selectAuthLoading)
  const authError       = useSelector(selectAuthError)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  })
  const [showPassword, setShowPassword]         = useState(false)
  const [showConfirm, setShowConfirm]           = useState(false)
  const [fieldErrors, setFieldErrors]           = useState({})
  const [touched, setTouched]                   = useState({})
  const [agreedToTerms, setAgreedToTerms]       = useState(false)
  const [termsError, setTermsError]             = useState(false)

  const passwordStrength = getStrength(form.password)

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  useEffect(() => () => dispatch(clearError()), [dispatch])

  const validate = (name, value) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'Ad gerekli'
        if (value.trim().length < 2) return 'Ad en az 2 karakter olmalı'
        return ''
      case 'lastName':
        if (!value.trim()) return 'Soyad gerekli'
        if (value.trim().length < 2) return 'Soyad en az 2 karakter olmalı'
        return ''
      case 'email':
        if (!value) return 'E-posta adresi gerekli'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Geçerli bir e-posta adresi girin'
        return ''
      case 'password':
        if (!value) return 'Şifre gerekli'
        if (value.length < 8) return 'Şifre en az 8 karakter olmalı'
        return ''
      case 'confirmPassword':
        if (!value) return 'Şifre tekrarı gerekli'
        if (value !== form.password) return 'Şifreler eşleşmiyor'
        return ''
      default:
        return ''
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (touched[name]) setFieldErrors(prev => ({ ...prev, [name]: validate(name, value) }))
    // Re-validate confirm if password changed
    if (name === 'password' && touched.confirmPassword) {
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: form.confirmPassword && value !== form.confirmPassword ? 'Şifreler eşleşmiyor' : '',
      }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    setFieldErrors(prev => ({ ...prev, [name]: validate(name, value) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const fields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword']
    setTouched(Object.fromEntries(fields.map(f => [f, true])))
    const errors = Object.fromEntries(fields.map(f => [f, validate(f, form[f])]))
    setFieldErrors(errors)

    if (!agreedToTerms) { setTermsError(true); return }
    if (Object.values(errors).some(Boolean)) return

    dispatch(registerUser({
      firstName: form.firstName.trim(),
      lastName:  form.lastName.trim(),
      email:     form.email,
      password:  form.password,
    }))
  }

  const handleOAuth = (provider) => {
    window.location.href = authService.getOAuthUrl(provider)
  }

  const fieldClass = (name) => [
    styles.field,
    fieldErrors[name] && touched[name] ? styles.fieldError : '',
    !fieldErrors[name] && touched[name] && form[name] ? styles.fieldSuccess : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Hesap Oluştur</h1>
        <p className={styles.subtitle}>Sinema dünyasına katılın</p>
      </div>

      <div className={styles.oauthGroup}>
        <button type="button" className={styles.oauthBtn} onClick={() => handleOAuth('google')} disabled={isLoading}>
          <GoogleIcon />
          Google ile kayıt ol
        </button>
        <button type="button" className={styles.oauthBtn} onClick={() => handleOAuth('github')} disabled={isLoading}>
          <GithubIcon />
          GitHub ile kayıt ol
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
        {/* Name row */}
        <div className={styles.nameRow}>
          <div className={fieldClass('firstName')}>
            <label htmlFor="firstName" className={styles.label}>Ad</label>
            <div className={styles.inputWrapper}>
              <UserIcon className={styles.inputIcon} />
              <input
                id="firstName" type="text" name="firstName"
                value={form.firstName} onChange={handleChange} onBlur={handleBlur}
                placeholder="Adınız" className={styles.input}
                autoComplete="given-name" disabled={isLoading}
              />
              {!fieldErrors.firstName && touched.firstName && form.firstName && <CheckIcon className={styles.inputStatus} />}
            </div>
            {fieldErrors.firstName && touched.firstName && <p className={styles.fieldErrorMsg}>{fieldErrors.firstName}</p>}
          </div>

          <div className={fieldClass('lastName')}>
            <label htmlFor="lastName" className={styles.label}>Soyad</label>
            <div className={styles.inputWrapper}>
              <input
                id="lastName" type="text" name="lastName"
                value={form.lastName} onChange={handleChange} onBlur={handleBlur}
                placeholder="Soyadınız" className={`${styles.input} ${styles.inputNoIcon}`}
                autoComplete="family-name" disabled={isLoading}
              />
              {!fieldErrors.lastName && touched.lastName && form.lastName && <CheckIcon className={styles.inputStatus} />}
            </div>
            {fieldErrors.lastName && touched.lastName && <p className={styles.fieldErrorMsg}>{fieldErrors.lastName}</p>}
          </div>
        </div>

        {/* Email */}
        <div className={fieldClass('email')}>
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

        {/* Password */}
        <div className={fieldClass('password')}>
          <label htmlFor="password" className={styles.label}>Şifre</label>
          <div className={styles.inputWrapper}>
            <LockIcon className={styles.inputIcon} />
            <input
              id="password" type={showPassword ? 'text' : 'password'} name="password"
              value={form.password} onChange={handleChange} onBlur={handleBlur}
              placeholder="En az 8 karakter" className={styles.input}
              autoComplete="new-password" disabled={isLoading}
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(v => !v)}
              tabIndex={-1} aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}>
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {fieldErrors.password && touched.password && <p className={styles.fieldErrorMsg}>{fieldErrors.password}</p>}
          {/* Strength meter */}
          {form.password && (
            <div className={styles.strengthMeter}>
              <div className={styles.strengthBars}>
                {[0,1,2,3,4].map(i => (
                  <div
                    key={i}
                    className={styles.strengthBar}
                    style={{ background: i <= passwordStrength ? STRENGTH_LEVELS[passwordStrength].color : 'var(--color-border-mid)' }}
                  />
                ))}
              </div>
              <span className={styles.strengthLabel} style={{ color: STRENGTH_LEVELS[passwordStrength]?.color }}>
                {STRENGTH_LEVELS[passwordStrength]?.label}
              </span>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div className={fieldClass('confirmPassword')}>
          <label htmlFor="confirmPassword" className={styles.label}>Şifre Tekrarı</label>
          <div className={styles.inputWrapper}>
            <LockIcon className={styles.inputIcon} />
            <input
              id="confirmPassword" type={showConfirm ? 'text' : 'password'} name="confirmPassword"
              value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur}
              placeholder="Şifrenizi tekrar girin" className={styles.input}
              autoComplete="new-password" disabled={isLoading}
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)}
              tabIndex={-1} aria-label={showConfirm ? 'Şifreyi gizle' : 'Şifreyi göster'}>
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {fieldErrors.confirmPassword && touched.confirmPassword && (
            <p className={styles.fieldErrorMsg}>{fieldErrors.confirmPassword}</p>
          )}
        </div>

        {/* Terms */}
        <label className={`${styles.termsLabel} ${termsError ? styles.termsError : ''}`}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={agreedToTerms}
            onChange={e => { setAgreedToTerms(e.target.checked); if (e.target.checked) setTermsError(false) }}
            disabled={isLoading}
          />
          <span className={styles.termsText}>
            <Link to="/terms" className={styles.termsLink}>Kullanım Koşulları</Link>
            {' '}ve{' '}
            <Link to="/privacy" className={styles.termsLink}>Gizlilik Politikası</Link>
            'nı okudum ve kabul ediyorum
          </span>
        </label>
        {termsError && <p className={styles.fieldErrorMsg}>Devam etmek için koşulları kabul etmeniz gerekiyor</p>}

        <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading}>
          Hesap Oluştur
        </Button>
      </form>

      <p className={styles.switchText}>
        Zaten hesabınız var mı?{' '}
        <Link to="/login" className={styles.switchLink}>Giriş yapın</Link>
      </p>
    </div>
  )
}

// ── Icons ──
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

const UserIcon = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
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
