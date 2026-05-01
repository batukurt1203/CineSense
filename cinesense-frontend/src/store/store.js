import { configureStore } from '@reduxjs/toolkit'
import authReducer    from './slices/authSlice'
import moviesReducer  from './slices/moviesSlice'
import sessionReducer from './slices/sessionSlice'
import uiReducer      from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth:    authReducer,
    movies:  moviesReducer,
    session: sessionReducer,
    ui:      uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
})

export default store
