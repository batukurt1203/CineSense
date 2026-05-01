// ── useAuth ──
import { useSelector, useDispatch } from 'react-redux'
import { selectUser, selectIsAuthenticated, selectAuthLoading, logoutUser } from '@store/slices/authSlice'

export function useAuth() {
  const dispatch       = useDispatch()
  const user           = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isLoading      = useSelector(selectAuthLoading)

  const logout = () => dispatch(logoutUser())

  return { user, isAuthenticated, isLoading, logout }
}
