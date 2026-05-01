import { createSlice } from '@reduxjs/toolkit'

// Manages mood matchmaker session & watch party state
const sessionSlice = createSlice({
  name: 'session',
  initialState: {
    // Matchmaker
    matchmakerStep:  0,
    totalSteps:      6,
    moodProfile: {
      moodScore:       null,  // 1-10
      viewingContext:  null,  // 'alone' | 'friends' | 'family' | 'date'
      availableTime:   null,  // 'under90' | '90to120' | 'over120'
      intensity:       null,  // 'light' | 'medium' | 'intense'
      genres:          [],
      language:        null,
    },
    sessionCompleted: false,

    // Watch Party
    watchParty: {
      sessionCode:  null,
      partyId:      null,
      isHost:       false,
      participants: [],
      status:       'idle', // 'idle' | 'lobby' | 'questionnaire' | 'results'
      socket:       null,
    },
  },
  reducers: {
    // Matchmaker
    nextStep: (state) => {
      if (state.matchmakerStep < state.totalSteps - 1) state.matchmakerStep++
    },
    prevStep: (state) => {
      if (state.matchmakerStep > 0) state.matchmakerStep--
    },
    setMoodProfile: (state, action) => {
      state.moodProfile = { ...state.moodProfile, ...action.payload }
    },
    completeSession: (state) => {
      state.sessionCompleted = true
    },
    resetSession: (state) => {
      state.matchmakerStep  = 0
      state.sessionCompleted = false
      state.moodProfile = {
        moodScore:      null,
        viewingContext: null,
        availableTime:  null,
        intensity:      null,
        genres:         [],
        language:       null,
      }
    },

    // Watch Party
    createParty: (state, action) => {
      state.watchParty = {
        ...state.watchParty,
        ...action.payload,
        isHost: true,
        status: 'lobby',
      }
    },
    joinParty: (state, action) => {
      state.watchParty = {
        ...state.watchParty,
        ...action.payload,
        isHost: false,
        status: 'lobby',
      }
    },
    updateParticipants: (state, action) => {
      state.watchParty.participants = action.payload
    },
    setPartyStatus: (state, action) => {
      state.watchParty.status = action.payload
    },
    leaveParty: (state) => {
      state.watchParty = {
        sessionCode:  null,
        partyId:      null,
        isHost:       false,
        participants: [],
        status:       'idle',
        socket:       null,
      }
    },
  },
})

export const {
  nextStep, prevStep, setMoodProfile, completeSession, resetSession,
  createParty, joinParty, updateParticipants, setPartyStatus, leaveParty,
} = sessionSlice.actions

// Selectors
export const selectMatchmakerStep  = (state) => state.session.matchmakerStep
export const selectTotalSteps      = (state) => state.session.totalSteps
export const selectMoodProfile     = (state) => state.session.moodProfile
export const selectSessionComplete = (state) => state.session.sessionCompleted
export const selectWatchParty      = (state) => state.session.watchParty

export default sessionSlice.reducer
