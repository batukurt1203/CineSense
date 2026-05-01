import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { movieService } from '@services/movieService'

// ── Async Thunks ──
export const fetchRecommendations = createAsyncThunk(
  'movies/fetchRecommendations',
  async (moodProfile, { rejectWithValue }) => {
    try {
      return await movieService.getRecommendations(moodProfile)
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to get recommendations')
    }
  }
)

export const searchMovies = createAsyncThunk(
  'movies/search',
  async ({ query, filters }, { rejectWithValue }) => {
    try {
      return await movieService.search(query, filters)
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Search failed')
    }
  }
)

export const fetchMovieById = createAsyncThunk(
  'movies/fetchById',
  async (movieId, { rejectWithValue }) => {
    try {
      return await movieService.getById(movieId)
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Movie not found')
    }
  }
)

// ── Slice ──
const moviesSlice = createSlice({
  name: 'movies',
  initialState: {
    recommendations: [],
    searchResults:   [],
    currentMovie:    null,
    watchlist:       [],
    isLoading:       false,
    isFallback:      false,  // true when AI engine timed out, using rule-based
    error:           null,
    searchQuery:     '',
    filters: {
      genre:    null,
      year:     null,
      rating:   null,
      language: null,
    },
  },
  reducers: {
    clearRecommendations: (state) => {
      state.recommendations = []
      state.isFallback      = false
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = { genre: null, year: null, rating: null, language: null }
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    addToWatchlist: (state, action) => {
      const exists = state.watchlist.find((m) => m.movieId === action.payload.movieId)
      if (!exists) state.watchlist.push({ ...action.payload, status: 'UNWATCHED', addedAt: new Date().toISOString() })
    },
    removeFromWatchlist: (state, action) => {
      state.watchlist = state.watchlist.filter((m) => m.movieId !== action.payload)
    },
    markAsWatched: (state, action) => {
      const item = state.watchlist.find((m) => m.movieId === action.payload)
      if (item) item.status = 'WATCHED'
    },
  },
  extraReducers: (builder) => {
    // Recommendations
    builder
      .addCase(fetchRecommendations.pending,   (state) => { state.isLoading = true; state.error = null })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.isLoading       = false
        state.recommendations = action.payload.movies
        state.isFallback      = action.payload.isFallback || false
      })
      .addCase(fetchRecommendations.rejected,  (state, action) => {
        state.isLoading = false
        state.error     = action.payload
      })

    // Search
    builder
      .addCase(searchMovies.pending,   (state) => { state.isLoading = true })
      .addCase(searchMovies.fulfilled, (state, action) => {
        state.isLoading    = false
        state.searchResults = action.payload
      })
      .addCase(searchMovies.rejected,  (state, action) => {
        state.isLoading = false
        state.error     = action.payload
      })

    // Movie Detail
    builder
      .addCase(fetchMovieById.pending,   (state) => { state.isLoading = true })
      .addCase(fetchMovieById.fulfilled, (state, action) => {
        state.isLoading   = false
        state.currentMovie = action.payload
      })
      .addCase(fetchMovieById.rejected,  (state, action) => {
        state.isLoading = false
        state.error     = action.payload
      })
  },
})

export const {
  clearRecommendations,
  setFilters,
  clearFilters,
  setSearchQuery,
  addToWatchlist,
  removeFromWatchlist,
  markAsWatched,
} = moviesSlice.actions

// Selectors
export const selectRecommendations = (state) => state.movies.recommendations
export const selectSearchResults   = (state) => state.movies.searchResults
export const selectCurrentMovie    = (state) => state.movies.currentMovie
export const selectWatchlist       = (state) => state.movies.watchlist
export const selectMoviesLoading   = (state) => state.movies.isLoading
export const selectIsFallback      = (state) => state.movies.isFallback

export default moviesSlice.reducer
