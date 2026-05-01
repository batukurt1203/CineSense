import { useState, useCallback } from 'react'

/**
 * Lightweight form state manager
 *
 * Usage:
 *   const { values, errors, handleChange, validate, setError } = useForm(
 *     { email: '', password: '' },
 *     validators
 *   )
 *
 * validators: { fieldName: (value, allValues) => errorString | null }
 */
export function useForm(initialValues = {}, validators = {}) {
  const [values, setValues]   = useState(initialValues)
  const [errors, setErrors]   = useState({})
  const [touched, setTouched] = useState({})

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    const newVal = type === 'checkbox' ? checked : value

    setValues((prev) => ({ ...prev, [name]: newVal }))

    // Clear error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
  }, [errors])

  const handleBlur = useCallback((e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))

    // Validate single field on blur
    if (validators[name]) {
      const error = validators[name](values[name], values)
      setErrors((prev) => ({ ...prev, [name]: error || null }))
    }
  }, [validators, values])

  const validate = useCallback(() => {
    const newErrors = {}
    let isValid = true

    Object.keys(validators).forEach((key) => {
      const error = validators[key](values[key], values)
      if (error) {
        newErrors[key] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    setTouched(Object.fromEntries(Object.keys(validators).map((k) => [k, true])))
    return isValid
  }, [validators, values])

  const setError = useCallback((name, message) => {
    setErrors((prev) => ({ ...prev, [name]: message }))
  }, [])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return { values, errors, touched, handleChange, handleBlur, validate, setError, reset, setValues }
}

// ── Common validators ──
export const validators = {
  required: (label) => (value) =>
    !value || !String(value).trim() ? `${label} is required` : null,

  email: (value) =>
    value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? 'Enter a valid email address'
      : null,

  minLength: (min) => (value) =>
    value && value.length < min ? `Must be at least ${min} characters` : null,

  password: (value) => {
    if (!value) return 'Password is required'
    if (value.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(value)) return 'Must contain at least one uppercase letter'
    if (!/[0-9]/.test(value)) return 'Must contain at least one number'
    return null
  },

  confirmPassword: (field) => (value, allValues) =>
    value !== allValues[field] ? 'Passwords do not match' : null,

  compose: (...fns) => (value, allValues) => {
    for (const fn of fns) {
      const err = fn(value, allValues)
      if (err) return err
    }
    return null
  },
}