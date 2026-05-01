import { useMatchmaker } from '@hooks/useMatchmaker'
import { useSelector } from 'react-redux'
import { selectRecommendations, selectMoviesLoading, selectIsFallback } from '@store/slices/moviesSlice'
import MovieCard from '@components/features/MovieCard'
import Button from '@components/common/Button'
import styles from './MatchmakerPage.module.css'

// ── Step config ──
const STEPS = [
  {
    id: 'mood',
    title: 'Bugün kendinizi nasıl hissediyorsunuz?',
    subtitle: 'Ruh halinizi 1-10 arasında puanlayın',
    field: 'moodScore',
    type: 'slider',
    min: 1, max: 10,
    labels: ['Çok kötü', 'Harika'],
  },
  {
    id: 'context',
    title: 'Kiminle izliyorsunuz?',
    subtitle: 'En iyi öneriler için izleme ortamınızı seçin',
    field: 'viewingContext',
    type: 'grid',
    options: [
      { value: 'alone',   label: 'Yalnız',   icon: '🎧' },
      { value: 'friends', label: 'Arkadaşlar', icon: '🍿' },
      { value: 'family',  label: 'Aile',      icon: '👨‍👩‍👧' },
      { value: 'date',    label: 'Sevgili',   icon: '💑' },
    ],
  },
  {
    id: 'time',
    title: 'Ne kadar zamanınız var?',
    subtitle: 'Film uzunluğuna göre önerileri filtreleyelim',
    field: 'availableTime',
    type: 'cards',
    options: [
      { value: 'under90',   label: '90 dk altı',  desc: 'Kısa bir film için mükemmel' },
      { value: '90to120',   label: '90–120 dk',   desc: 'Standart film uzunluğu' },
      { value: 'over120',   label: '120 dk üstü', desc: 'Epik bir maceraya hazır mısınız?' },
    ],
  },
  {
    id: 'intensity',
    title: 'Hangi yoğunlukta bir film istiyorsunuz?',
    subtitle: 'Duygusal ağırlık ve hız tercihini belirleyin',
    field: 'intensity',
    type: 'cards',
    options: [
      { value: 'light',   label: 'Hafif',   desc: 'Komedi, animasyon, keyifli' },
      { value: 'medium',  label: 'Orta',    desc: 'Drama, gerilim, denge' },
      { value: 'intense', label: 'Yoğun',   desc: 'Aksiyon, korku, derin drama' },
    ],
  },
  {
    id: 'genres',
    title: 'Favori türleriniz neler?',
    subtitle: 'Birden fazla seçebilirsiniz',
    field: 'genres',
    type: 'multiselect',
    options: [
      { value: 'Action',      label: 'Aksiyon',    icon: '💥' },
      { value: 'Comedy',      label: 'Komedi',     icon: '😂' },
      { value: 'Drama',       label: 'Drama',      icon: '🎭' },
      { value: 'Horror',      label: 'Korku',      icon: '😱' },
      { value: 'Romance',     label: 'Romantik',   icon: '💕' },
      { value: 'Sci-Fi',      label: 'Bilim Kurgu',icon: '🚀' },
      { value: 'Thriller',    label: 'Gerilim',    icon: '🔪' },
      { value: 'Animation',   label: 'Animasyon',  icon: '🎨' },
      { value: 'Documentary', label: 'Belgesel',   icon: '🎬' },
      { value: 'Fantasy',     label: 'Fantastik',  icon: '🧙' },
    ],
  },
  {
    id: 'language',
    title: 'Dil tercihiniz?',
    subtitle: 'Altyazılı veya orijinal dil',
    field: 'language',
    type: 'grid',
    options: [
      { value: null,       label: 'Farketmez', icon: '🌍' },
      { value: 'English',  label: 'İngilizce', icon: '🇺🇸' },
      { value: 'Turkish',  label: 'Türkçe',    icon: '🇹🇷' },
      { value: 'Korean',   label: 'Korece',    icon: '🇰🇷' },
      { value: 'French',   label: 'Fransızca', icon: '🇫🇷' },
      { value: 'Japanese', label: 'Japonca',   icon: '🇯🇵' },
    ],
  },
]

export default function MatchmakerPage() {
  const {
    currentStep, totalSteps, moodProfile, sessionCompleted,
    progress, goNext, goPrev, updateMood, submit, reset,
  } = useMatchmaker()

  const recommendations = useSelector(selectRecommendations)
  const isLoading       = useSelector(selectMoviesLoading)
  const isFallback      = useSelector(selectIsFallback)

  const step = STEPS[currentStep]

  const canAdvance = () => {
    if (!step) return false
    const val = moodProfile[step.field]
    if (step.type === 'multiselect') return val?.length > 0
    return val !== null && val !== undefined
  }

  const handleNext = () => {
    if (currentStep === totalSteps - 1) {
      submit()
    } else {
      goNext()
    }
  }

  // ── Results screen ──
  if (sessionCompleted) {
    return (
      <div className={styles.page}>
        <div className={styles.resultsHeader}>
          <h1 className={styles.resultsTitle}>
            {isLoading ? 'Sizin için aranıyor…' : 'İşte önerileriniz'}
          </h1>
          {isFallback && !isLoading && (
            <p className={styles.fallbackNote}>
              ⚡ AI motoru zaman aşımına uğradı; alternatif sistem devreye girdi.
            </p>
          )}
          {!isLoading && (
            <button className={styles.resetBtn} onClick={reset}>
              <RefreshIcon /> Tekrar başla
            </button>
          )}
        </div>

        {isLoading && (
          <div className={styles.loadingState}>
            <div className={styles.filmReel}>🎬</div>
            <p>AI, ruh halinize uygun filmler seçiyor…</p>
          </div>
        )}

        {!isLoading && recommendations.length > 0 && (
          <div className={styles.resultsGrid}>
            {recommendations.map((movie, i) => (
              <MovieCard
                key={movie.movieId}
                movie={movie}
                matchScore={movie.matchScore ?? Math.max(70, 98 - i * 4)}
                showExplain
              />
            ))}
          </div>
        )}

        {!isLoading && recommendations.length === 0 && (
          <div className={styles.noResults}>
            <p>Eşleşen film bulunamadı. Farklı bir profil deneyin.</p>
            <Button variant="secondary" onClick={reset}>Tekrar dene</Button>
          </div>
        )}
      </div>
    )
  }

  // ── Questionnaire ──
  return (
    <div className={styles.page}>
      <div className={styles.questionnaireWrap}>
        {/* Progress */}
        <div className={styles.progressSection}>
          <div className={styles.stepInfo}>
            <span className={styles.stepCount}>{currentStep + 1} / {totalSteps}</span>
            <span className={styles.stepId}>{step?.id}</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Step */}
        <div className={styles.stepCard} key={currentStep}>
          <h2 className={styles.stepTitle}>{step?.title}</h2>
          <p className={styles.stepSubtitle}>{step?.subtitle}</p>

          <div className={styles.stepContent}>
            {step?.type === 'slider' && (
              <SliderStep step={step} value={moodProfile[step.field]} onChange={v => updateMood({ [step.field]: v })} />
            )}
            {step?.type === 'grid' && (
              <GridStep step={step} value={moodProfile[step.field]} onChange={v => updateMood({ [step.field]: v })} />
            )}
            {step?.type === 'cards' && (
              <CardsStep step={step} value={moodProfile[step.field]} onChange={v => updateMood({ [step.field]: v })} />
            )}
            {step?.type === 'multiselect' && (
              <MultiSelectStep step={step} value={moodProfile[step.field] || []} onChange={v => updateMood({ [step.field]: v })} />
            )}
          </div>

          {/* Navigation */}
          <div className={styles.navigation}>
            <Button variant="ghost" size="md" onClick={goPrev} disabled={currentStep === 0}>
              ← Geri
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              disabled={!canAdvance()}
            >
              {currentStep === totalSteps - 1 ? '✨ Film bul' : 'İleri →'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Step sub-components ──

function SliderStep({ step, value, onChange }) {
  const val = value ?? Math.ceil((step.max + step.min) / 2)
  return (
    <div className={styles.sliderWrap}>
      <div className={styles.sliderValue}>{val}</div>
      <input
        type="range"
        min={step.min} max={step.max}
        value={val}
        onChange={e => onChange(Number(e.target.value))}
        className={styles.slider}
      />
      <div className={styles.sliderLabels}>
        <span>{step.labels[0]}</span>
        <span>{step.labels[1]}</span>
      </div>
    </div>
  )
}

function GridStep({ step, value, onChange }) {
  return (
    <div className={styles.gridOptions}>
      {step.options.map(opt => (
        <button
          key={String(opt.value)}
          className={`${styles.gridOption} ${value === opt.value ? styles.gridOptionActive : ''}`}
          onClick={() => onChange(opt.value)}
        >
          <span className={styles.gridOptionIcon}>{opt.icon}</span>
          <span className={styles.gridOptionLabel}>{opt.label}</span>
        </button>
      ))}
    </div>
  )
}

function CardsStep({ step, value, onChange }) {
  return (
    <div className={styles.cardOptions}>
      {step.options.map(opt => (
        <button
          key={opt.value}
          className={`${styles.cardOption} ${value === opt.value ? styles.cardOptionActive : ''}`}
          onClick={() => onChange(opt.value)}
        >
          <span className={styles.cardOptionLabel}>{opt.label}</span>
          <span className={styles.cardOptionDesc}>{opt.desc}</span>
        </button>
      ))}
    </div>
  )
}

function MultiSelectStep({ step, value, onChange }) {
  const toggle = (val) => {
    const next = value.includes(val)
      ? value.filter(v => v !== val)
      : [...value, val]
    onChange(next)
  }
  return (
    <div className={styles.multiGrid}>
      {step.options.map(opt => (
        <button
          key={opt.value}
          className={`${styles.multiOption} ${value.includes(opt.value) ? styles.multiOptionActive : ''}`}
          onClick={() => toggle(opt.value)}
        >
          <span>{opt.icon}</span>
          <span>{opt.label}</span>
          {value.includes(opt.value) && <span className={styles.checkMark}>✓</span>}
        </button>
      ))}
    </div>
  )
}

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
)