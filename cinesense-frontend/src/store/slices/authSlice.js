import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '@services/authService'

// ── Async Thunks ──
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials)
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      return await authService.register(userData)
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed')
    }
  }
)

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await authService.logout()
})

export const refreshToken = createAsyncThunk('auth/refresh', async (_, { rejectWithValue }) => {
  try {
    return await authService.refresh()
  } catch (err) {
    return rejectWithValue('Session expired')
  }
})

// ── Slice ──
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            null,
    token:           null,
    isAuthenticated: false,
    isLoading:       false,
    error:           null,
  },
  reducers: {
    clearError: (state) => { state.error = null },
    setUser:    (state, action) => {
      state.user            = action.payload
      state.isAuthenticated = !!action.payload
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending,   (state) => { state.isLoading = true; state.error = null })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading       = false
        state.user            = action.payload.user
        state.token           = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected,  (state, action) => {
        state.isLoading = false
        state.error     = action.payload
      })

    // Register
    builder
      .addCase(registerUser.pending,   (state) => { state.isLoading = true; state.error = null })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading       = false
        state.user            = action.payload.user
        state.token           = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(registerUser.rejected,  (state, action) => {
        state.isLoading = false
        state.error     = action.payload
      })

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user            = null
      state.token           = null
      state.isAuthenticated = false
    })

    // Refresh
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token           = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user            = null
        state.token           = null
        state.isAuthenticated = false
      })
  },
})

export const { clearError, setUser } = authSlice.actions

// Selectors
export const selectUser            = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthLoading     = (state) => state.auth.isLoading
export const selectAuthError       = (state) => state.auth.error

export default authSlice.reducer
