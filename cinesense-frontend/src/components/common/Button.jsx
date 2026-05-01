import { clsx } from 'clsx'
import styles from './Button.module.css'

/**
 * Button component
 *
 * @param {'primary'|'secondary'|'ghost'|'danger'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} loading
 * @param {boolean} fullWidth
 */
export default function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  fullWidth = false,
  disabled,
  className,
  ...props
}) {
  return (
    <button
      className={clsx(
        styles.btn,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        loading   && styles.loading,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
      <span className={loading ? styles.loadingText : undefined}>{children}</span>
    </button>
  )
}
