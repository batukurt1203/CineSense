import apiClient from './apiClient'

export const movieService = {
  /**
   * UC-002: Get AI recommendations from mood profile
   * @param {Object} moodProfile
   * @returns {{ movies: Movie[], isFallback: boolean }}
   */
  async getRecommendations(moodProfile) {
    const { data } = await apiClient.post('/recommend', { moodProfile })
    return data
  },

  /**
   * UC-004: Search and filter movies
   * @param {string} query
   * @param {Object} filters – { genre, year, rating, language }
   * @returns {Movie[]}
   */
  async search(query, filters = {}) {
    const { data } = await apiClient.get('/movies/search', {
      params: { q: query, ...filters },
    })
    return data
  },

  /**
   * Get single movie with full metadata + streaming links
   * @param {string|number} movieId
   * @returns {Movie}
   */
  async getById(movieId) {
    const { data } = await apiClient.get(`/movies/${movieId}`)
    return data
  },

  /**
   * UC-007: Get AI explanation for why a movie was recommended
   * @param {string|number} movieId
   * @param {Object} moodProfile
   * @returns {{ explanation: string }}
   */
  async getExplanation(movieId, moodProfile) {
    const { data } = await apiClient.post(`/movies/${movieId}/explain`, { moodProfile })
    return data
  },

  /**
   * UC-006: Submit a rating/review
   */
  async submitRating(movieId, { stars, reviewText }) {
    const { data } = await apiClient.post(`/movies/${movieId}/ratings`, { stars, reviewText })
    return data
  },

  /**
   * Edit existing rating
   */
  async editRating(movieId, { stars, reviewText }) {
    const { data } = await apiClient.put(`/movies/${movieId}/ratings`, { stars, reviewText })
    return data
  },

  /**
   * Report a review
   */
  async reportReview(reviewId, reason) {
    const { data } = await apiClient.post(`/reviews/${reviewId}/report`, { reason })
    return data
  },

  // ── Watchlist ──
  async getWatchlist() {
    const { data } = await apiClient.get('/users/me/watchlist')
    return data
  },

  async addToWatchlist(movieId) {
    const { data } = await apiClient.post('/users/me/watchlist', { movieId })
    return data
  },

  async removeFromWatchlist(movieId) {
    const { data } = await apiClient.delete(`/users/me/watchlist/${movieId}`)
    return data
  },

  async markWatched(movieId) {
    const { data } = await apiClient.patch(`/users/me/watchlist/${movieId}`, { status: 'WATCHED' })
    return data
  },

  // ── History ──
  async getHistory() {
    const { data } = await apiClient.get('/users/me/history')
    return data
  },
}
