import apiClient from './apiClient'

export const authService = {
  /**
   * Login with email/password
   * @returns {{ user, token }}
   */
  async login({ email, password }) {
    const { data } = await apiClient.post('/auth/login', { email, password })
    return data
  },

  /**
   * Register new account
   * @returns {{ user, token }}
   */
  async register({ firstName, lastName, email, password }) {
    const { data } = await apiClient.post('/auth/register', {
      firstName, lastName, email, password,
    })
    return data
  },

  /**
   * Logout — clears HttpOnly refresh token cookie on server
   */
  async logout() {
    await apiClient.post('/auth/logout')
  },

  /**
   * Refresh access token using HttpOnly cookie
   * @returns {{ token }}
   */
  async refresh() {
    const { data } = await apiClient.post('/auth/refresh')
    return data
  },

  /**
   * OAuth redirect URL
   * @param {'google'|'github'} provider
   */
  getOAuthUrl(provider) {
    return `${import.meta.env.VITE_API_URL || '/api/v1'}/auth/oauth/${provider}`
  },

  /**
   * Request password reset email
   */
  async forgotPassword(email) {
    const { data } = await apiClient.post('/auth/forgot-password', { email })
    return data
  },

  /**
   * Reset password with token
   */
  async resetPassword({ token, password }) {
    const { data } = await apiClient.post('/auth/reset-password', { token, password })
    return data
  },

  /**
   * Resend verification email
   */
  async resendVerification(email) {
    const { data } = await apiClient.post('/auth/resend-verification', { email })
    return data
  },
}
