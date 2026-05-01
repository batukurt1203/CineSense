import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  createParty, joinParty, updateParticipants,
  setPartyStatus, leaveParty, selectWatchParty,
} from '@store/slices/sessionSlice'
import {
  setMoodProfile, selectMoodProfile, resetSession,
} from '@store/slices/sessionSlice'
import { selectIsAuthenticated, selectUser } from '@store/slices/authSlice'
import { watchPartySocket } from '@services/watchPartyService'
import Button from '@components/common/Button'
import MovieCard from '@components/features/MovieCard'
import styles from './WatchPartyPage.module.css'

// ── Mood step config (kısaltılmış, WatchParty için) ──────────────────────────
const MOOD_STEPS = [
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
    id: 'intensity',
    title: 'Hangi yoğunluğu tercih edersiniz?',
    subtitle: 'Grup için ideal film türünü belirleyelim',
    field: 'intensity',
    type: 'cards',
    options: [
      { value: 'light',   label: 'Hafif 😄',   desc: 'Komedi, animasyon, keyifli' },
      { value: 'medium',  label: 'Orta 🎭',    desc: 'Drama, gerilim, denge' },
      { value: 'intense', label: 'Yoğun ⚡',   desc: 'Aksiyon, korku, derin drama' },
    ],
  },
  {
    id: 'genres',
    title: 'Favori türleriniz?',
    subtitle: 'Birden fazla seçebilirsiniz',
    field: 'genres',
    type: 'multiselect',
    options: [
      { value: 'Action',      label: 'Aksiyon',     icon: '💥' },
      { value: 'Comedy',      label: 'Komedi',      icon: '😂' },
      { value: 'Drama',       label: 'Drama',       icon: '🎭' },
      { value: 'Horror',      label: 'Korku',       icon: '😱' },
      { value: 'Romance',     label: 'Romantik',    icon: '💕' },
      { value: 'Sci-Fi',      label: 'Bilim Kurgu', icon: '🚀' },
      { value: 'Thriller',    label: 'Gerilim',     icon: '🔪' },
      { value: 'Animation',   label: 'Animasyon',   icon: '🎨' },
    ],
  },
]

// ──────────────────────────────────────────────────────────────────────────────
export default function WatchPartyPage() {
  const { code } = useParams()
  const navigate  = useNavigate()
  const dispatch  = useDispatch()

  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user            = useSelector(selectUser)
  const watchParty      = useSelector(selectWatchParty)
  const moodProfile     = useSelector(selectMoodProfile)

  // Local UI state
  const [view, setView]             = useState('landing') // 'landing' | 'create' | 'join' | 'lobby' | 'questionnaire' | 'results'
  const [joinCode, setJoinCode]     = useState(code || '')
  const [partyResults, setPartyResults] = useState([])
  const [moodStep, setMoodStep]     = useState(0)
  const [error, setError]           = useState('')
  const [copied, setCopied]         = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  const socketRef = useRef(null)

  // ── Auto-join via URL param ───────────────────────────────────────────────
  useEffect(() => {
    if (code && view === 'landing') {
      setView('join')
    }
  }, [code])

  // ── Socket cleanup on unmount ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      watchPartySocket.disconnect()
      dispatch(leaveParty())
      dispatch(resetSession())
    }
  }, [])

  // ── Socket setup when entering lobby ─────────────────────────────────────
  const setupSocket = useCallback((sessionCode, token = null) => {
    const socket = watchPartySocket.connect(sessionCode, token)
    socketRef.current = socket

    const unsubs = [
      watchPartySocket.onParticipantJoined((data) => {
        dispatch(updateParticipants(data.participants))
      }),
      watchPartySocket.onParticipantLeft((data) => {
        dispatch(updateParticipants(data.participants))
      }),
      watchPartySocket.onParticipantReady((data) => {
        dispatch(updateParticipants(data.participants))
      }),
      watchPartySocket.onPartyStarted(() => {
        dispatch(setPartyStatus('questionnaire'))
        setView('questionnaire')
        setMoodStep(0)
      }),
      watchPartySocket.onResultsReady((data) => {
        setPartyResults(data.results || [])
        dispatch(setPartyStatus('results'))
        setView('results')
      }),
      watchPartySocket.onError((err) => {
        setError(err?.message || 'Bir hata oluştu')
        setIsConnecting(false)
      }),
    ]

    return () => unsubs.forEach(fn => fn())
  }, [dispatch])

  // ── Create party ──────────────────────────────────────────────────────────
  const handleCreate = () => {
    const code = generateCode()
    dispatch(createParty({ sessionCode: code, partyId: code }))
    setupSocket(code, user?.token)
    setView('lobby')
    setIsConnecting(false)
  }

  // ── Join party ────────────────────────────────────────────────────────────
  const handleJoin = () => {
    const trimmed = joinCode.trim().toUpperCase()
    if (!trimmed || trimmed.length < 4) {
      setError('Geçerli bir kod girin')
      return
    }
    setIsConnecting(true)
    setError('')
    dispatch(joinParty({ sessionCode: trimmed }))
    setupSocket(trimmed, user?.token)
    setView('lobby')
    setTimeout(() => setIsConnecting(false), 1000)
  }

  // ── Start party (host only) ───────────────────────────────────────────────
  const handleStart = () => {
    watchPartySocket.startParty()
    dispatch(setPartyStatus('questionnaire'))
    setView('questionnaire')
    setMoodStep(0)
  }

  // ── Submit mood step ──────────────────────────────────────────────────────
  const handleMoodNext = () => {
    if (moodStep < MOOD_STEPS.length - 1) {
      setMoodStep(s => s + 1)
    } else {
      watchPartySocket.submitMoodProfile(moodProfile)
      setView('waiting')
    }
  }

  const handleMoodBack = () => {
    if (moodStep > 0) setMoodStep(s => s - 1)
  }

  const updateMood = (updates) => dispatch(setMoodProfile(updates))

  // ── Leave ─────────────────────────────────────────────────────────────────
  const handleLeave = () => {
    watchPartySocket.disconnect()
    dispatch(leaveParty())
    dispatch(resetSession())
    navigate('/')
  }

  // ── Copy code ─────────────────────────────────────────────────────────────
  const copyCode = () => {
    navigator.clipboard.writeText(watchParty.sessionCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentMoodStep = MOOD_STEPS[moodStep]
  const canAdvanceMood = () => {
    if (!currentMoodStep) return false
    const val = moodProfile[currentMoodStep.field]
    if (currentMoodStep.type === 'multiselect') return val?.length > 0
    return val !== null && val !== undefined
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEWS
  // ══════════════════════════════════════════════════════════════════════════

  // ── Landing ───────────────────────────────────────────────────────────────
  if (view === 'landing') {
    return (
      <div className={styles.page}>
        <div className={styles.hero}>
          <div className={styles.heroGlow} />
          <div className={styles.heroBadge}>🎬 Watch Party</div>
          <h1 className={styles.heroTitle}>
            Birlikte izleyin,<br />
            <span className={styles.heroGold}>birlikte seçin</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Arkadaşlarınızla aynı anda ruh halinizi paylaşın.
            Yapay zeka, grubun ortak zevkine en uygun filmi önersin.
          </p>

          <div className={styles.landingActions}>
            <button className={styles.createBtn} onClick={() => setView('create')}>
              <span className={styles.createBtnIcon}>✦</span>
              Parti Oluştur
            </button>
            <button className={styles.joinBtn} onClick={() => setView('join')}>
              Partiye Katıl
            </button>
          </div>

          <div className={styles.howItWorks}>
            <h3 className={styles.howTitle}>Nasıl çalışır?</h3>
            <div className={styles.steps}>
              {HOW_STEPS.map((s, i) => (
                <div key={i} className={styles.howStep}>
                  <div className={styles.howNumber}>{i + 1}</div>
                  <div className={styles.howIcon}>{s.icon}</div>
                  <p className={styles.howText}>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Create ────────────────────────────────────────────────────────────────
  if (view === 'create') {
    return (
      <div className={styles.page}>
        <div className={styles.formCard}>
          <button className={styles.backBtn} onClick={() => setView('landing')}>
            ← Geri
          </button>
          <div className={styles.formIcon}>🎪</div>
          <h2 className={styles.formTitle}>Yeni Parti Oluştur</h2>
          <p className={styles.formSubtitle}>
            Arkadaşlarınızı davet etmek için benzersiz bir kod oluşturulacak.
          </p>
          {!isAuthenticated && (
            <div className={styles.anonNote}>
              👤 Misafir olarak devam ediyorsunuz. Giriş yaparsanız adınız görünür.
            </div>
          )}
          <button className={styles.createBigBtn} onClick={handleCreate}>
            <span>Partiyi Başlat</span>
            <span className={styles.btnArrow}>→</span>
          </button>
        </div>
      </div>
    )
  }

  // ── Join ──────────────────────────────────────────────────────────────────
  if (view === 'join') {
    return (
      <div className={styles.page}>
        <div className={styles.formCard}>
          <button className={styles.backBtn} onClick={() => { setView('landing'); setError('') }}>
            ← Geri
          </button>
          <div className={styles.formIcon}>🎟️</div>
          <h2 className={styles.formTitle}>Partiye Katıl</h2>
          <p className={styles.formSubtitle}>
            Ev sahibinden aldığınız kodu girin.
          </p>
          <div className={styles.codeInputWrap}>
            <input
              className={`${styles.codeInput} ${error ? styles.codeInputError : ''}`}
              type="text"
              placeholder="ABCD"
              value={joinCode}
              onChange={e => { setJoinCode(e.target.value.toUpperCase()); setError('') }}
              maxLength={8}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
            />
          </div>
          {error && <p className={styles.errorMsg}>{error}</p>}
          <button
            className={styles.createBigBtn}
            onClick={handleJoin}
            disabled={isConnecting}
          >
            {isConnecting ? <Spinner /> : <><span>Katıl</span><span className={styles.btnArrow}>→</span></>}
          </button>
        </div>
      </div>
    )
  }

  // ── Lobby ─────────────────────────────────────────────────────────────────
  if (view === 'lobby') {
    const { sessionCode, isHost, participants } = watchParty
    const shareUrl = `${window.location.origin}/watch-party/${sessionCode}`

    return (
      <div className={styles.page}>
        <div className={styles.lobbyWrap}>
          <div className={styles.lobbyHeader}>
            <h2 className={styles.lobbyTitle}>
              {isHost ? '🎬 Partiyi Kuruyorsunuz' : '🍿 Parti Bekleme Odası'}
            </h2>
            <p className={styles.lobbySubtitle}>
              {isHost
                ? 'Arkadaşlarınız katıldıktan sonra başlatabilirsiniz.'
                : 'Ev sahibi partiyi başlatmasını bekleyin.'}
            </p>
          </div>

          {/* Session Code */}
          <div className={styles.codeCard}>
            <span className={styles.codeLabel}>Davet Kodu</span>
            <div className={styles.codeDisplay}>
              <span className={styles.codeText}>{sessionCode}</span>
              <button className={styles.copyBtn} onClick={copyCode}>
                {copied ? '✓ Kopyalandı' : '📋 Kopyala'}
              </button>
            </div>
            <span className={styles.codeHint}>veya linki paylaşın: <em>{shareUrl}</em></span>
          </div>

          {/* Participants */}
          <div className={styles.participantsCard}>
            <h3 className={styles.participantsTitle}>
              Katılımcılar
              <span className={styles.participantCount}>{participants.length}</span>
            </h3>
            <div className={styles.participantsList}>
              {participants.length === 0 ? (
                <div className={styles.waitingParticipants}>
                  <div className={styles.pulseDot} />
                  <span>Katılımcı bekleniyor…</span>
                </div>
              ) : (
                participants.map((p, i) => (
                  <div key={p.id || i} className={styles.participant}>
                    <div className={styles.participantAvatar}>
                      {(p.name || 'M')[0].toUpperCase()}
                    </div>
                    <span className={styles.participantName}>{p.name || `Misafir ${i + 1}`}</span>
                    {p.isHost && <span className={styles.hostBadge}>Ev Sahibi</span>}
                    {p.isReady && <span className={styles.readyBadge}>✓ Hazır</span>}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.lobbyActions}>
            {isHost && (
              <button
                className={styles.startBtn}
                onClick={handleStart}
                disabled={participants.length < 1}
              >
                <span>🎬 Partiyi Başlat</span>
              </button>
            )}
            <button className={styles.leaveBtn} onClick={handleLeave}>
              Ayrıl
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Questionnaire ─────────────────────────────────────────────────────────
  if (view === 'questionnaire') {
    const step     = currentMoodStep
    const progress = Math.round(((moodStep + 1) / MOOD_STEPS.length) * 100)

    return (
      <div className={styles.page}>
        <div className={styles.questionnaireWrap}>
          <div className={styles.qProgress}>
            <div className={styles.qProgressBar}>
              <div className={styles.qProgressFill} style={{ width: `${progress}%` }} />
            </div>
            <span className={styles.qProgressLabel}>{moodStep + 1} / {MOOD_STEPS.length}</span>
          </div>

          <div className={styles.qCard} key={moodStep}>
            <h2 className={styles.qTitle}>{step.title}</h2>
            <p className={styles.qSubtitle}>{step.subtitle}</p>

            <div className={styles.qContent}>
              {step.type === 'slider' && (
                <SliderStep step={step} value={moodProfile[step.field]} onChange={v => updateMood({ [step.field]: v })} />
              )}
              {step.type === 'cards' && (
                <CardsStep step={step} value={moodProfile[step.field]} onChange={v => updateMood({ [step.field]: v })} />
              )}
              {step.type === 'multiselect' && (
                <MultiSelectStep step={step} value={moodProfile[step.field] || []} onChange={v => updateMood({ [step.field]: v })} />
              )}
            </div>

            <div className={styles.qNav}>
              <Button variant="ghost" size="md" onClick={handleMoodBack} disabled={moodStep === 0}>
                ← Geri
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleMoodNext}
                disabled={!canAdvanceMood()}
              >
                {moodStep === MOOD_STEPS.length - 1 ? '✨ Gönder' : 'İleri →'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Waiting (after submit) ────────────────────────────────────────────────
  if (view === 'waiting') {
    return (
      <div className={styles.page}>
        <div className={styles.waitingWrap}>
          <div className={styles.filmReelAnim}>🎬</div>
          <h2 className={styles.waitingTitle}>Ruh haliniz gönderildi!</h2>
          <p className={styles.waitingSubtitle}>
            Diğer katılımcıların cevapları bekleniyor…
          </p>
          <div className={styles.waitingDots}>
            <span /><span /><span />
          </div>
          <div className={styles.participantsReadyList}>
            {watchParty.participants.map((p, i) => (
              <div key={p.id || i} className={`${styles.readyItem} ${p.isReady ? styles.readyItemDone : ''}`}>
                <span>{p.name || `Misafir ${i + 1}`}</span>
                <span>{p.isReady ? '✓' : '…'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Results ───────────────────────────────────────────────────────────────
  if (view === 'results') {
    return (
      <div className={styles.page}>
        <div className={styles.resultsWrap}>
          <div className={styles.resultsHeader}>
            <div className={styles.resultsBadge}>🏆 Grup Önerileri</div>
            <h1 className={styles.resultsTitle}>Grubunuz için en iyi filmler</h1>
            <p className={styles.resultsSubtitle}>
              {watchParty.participants.length} kişinin ruh hali birleştirildi
            </p>
          </div>

          {partyResults.length === 0 ? (
            <div className={styles.noResults}>
              <p>Eşleşen film bulunamadı. Farklı tercihler deneyin.</p>
            </div>
          ) : (
            <div className={styles.resultsGrid}>
              {partyResults.map((movie, i) => (
                <MovieCard
                  key={movie.movieId || i}
                  movie={movie}
                  matchScore={movie.matchScore ?? Math.max(70, 98 - i * 4)}
                  showExplain={false}
                />
              ))}
            </div>
          )}

          <div className={styles.resultsActions}>
            <button className={styles.leaveBtn} onClick={handleLeave}>
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// ── Step sub-components ────────────────────────────────────────────────────

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

function Spinner() {
  return <span className={styles.spinner}>⟳</span>
}

// ── Helpers ────────────────────────────────────────────────────────────────

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const HOW_STEPS = [
  { icon: '🎪', text: 'Parti oluştur veya koda girerek katıl' },
  { icon: '🎭', text: 'Herkes kendi ruh halini ve tercihlerini seçer' },
  { icon: '🤖', text: 'Yapay zeka tüm profilleri birleştirip film önerir' },
  { icon: '🍿', text: 'Grupta oylanıp film seçilir, izlemeye başlanır' },
]