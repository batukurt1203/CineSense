import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    darkMode:     true,  // CineSense is dark by default
    mobileMenuOpen: false,
    activeModal:  null,  // null | 'login' | 'register' | 'explanation' | 'review'
    modalData:    null,
  },
  reducers: {
    toggleDarkMode:    (state) => { state.darkMode = !state.darkMode },
    toggleMobileMenu:  (state) => { state.mobileMenuOpen = !state.mobileMenuOpen },
    closeMobileMenu:   (state) => { state.mobileMenuOpen = false },
    openModal:  (state, action) => {
      state.activeModal = action.payload.modal
      state.modalData   = action.payload.data || null
    },
    closeModal: (state) => {
      state.activeModal = null
      state.modalData   = null
    },
  },
})

export const { toggleDarkMode, toggleMobileMenu, closeMobileMenu, openModal, closeModal } = uiSlice.actions

export const selectDarkMode      = (state) => state.ui.darkMode
export const selectMobileMenu    = (state) => state.ui.mobileMenuOpen
export const selectActiveModal   = (state) => state.ui.activeModal
export const selectModalData     = (state) => state.ui.modalData

export default uiSlice.reducer
