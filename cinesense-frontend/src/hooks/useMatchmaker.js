import { useDispatch, useSelector } from 'react-redux'
import {
  nextStep, prevStep, setMoodProfile, resetSession, completeSession,
  selectMatchmakerStep, selectTotalSteps, selectMoodProfile, selectSessionComplete,
} from '@store/slices/sessionSlice'
import { fetchRecommendations } from '@store/slices/moviesSlice'

export function useMatchmaker() {
  const dispatch         = useDispatch()
  const currentStep      = useSelector(selectMatchmakerStep)
  const totalSteps       = useSelector(selectTotalSteps)
  const moodProfile      = useSelector(selectMoodProfile)
  const sessionCompleted = useSelector(selectSessionComplete)

  const progress = Math.round((currentStep / (totalSteps - 1)) * 100)

  const goNext = () => dispatch(nextStep())
  const goPrev = () => dispatch(prevStep())

  const updateMood = (updates) => dispatch(setMoodProfile(updates))

  const submit = async () => {
    dispatch(completeSession())
    await dispatch(fetchRecommendations(moodProfile))
  }

  const reset = () => dispatch(resetSession())

  return {
    currentStep,
    totalSteps,
    moodProfile,
    sessionCompleted,
    progress,
    goNext,
    goPrev,
    updateMood,
    submit,
    reset,
  }
}
