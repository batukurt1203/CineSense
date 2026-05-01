import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '@store/slices/authSlice'

// Layouts
import MainLayout from '@components/layout/MainLayout'
import AuthLayout from '@components/layout/AuthLayout'

// Pages
import HomePage from '@pages/HomePage'
import LoginPage from '@pages/LoginPage'
import RegisterPage from '@pages/RegisterPage'
import MatchmakerPage from '@pages/MatchmakerPage'
import WatchPartyPage from '@pages/WatchPartyPage'
import MovieDetailPage from '@pages/MovieDetailPage'
import WatchlistPage from '@pages/WatchlistPage'
import ProfilePage from '@pages/ProfilePage'
import SearchPage from '@pages/SearchPage'
import NotFoundPage from '@pages/NotFoundPage'

// Route guard
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Main App Routes */}
      <Route element={<MainLayout />}>
        <Route path="/"          element={<HomePage />} />
        <Route path="/search"    element={<SearchPage />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        <Route path="/matchmaker" element={<MatchmakerPage />} />
        <Route path="/watch-party/:code?" element={<WatchPartyPage />} />

        {/* Protected Routes */}
        <Route path="/watchlist" element={
          <ProtectedRoute><WatchlistPage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
