import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  searchMovies,
  setFilters, clearFilters, setSearchQuery,
  selectSearchResults, selectMoviesLoading,
} from '@store/slices/moviesSlice'
import MovieCard from '@components/features/MovieCard'
import styles from './SearchPage.module.css'

const GENRES = ['Action','Adventure','Animation','Comedy','Crime','Documentary',
  'Drama','Fantasy','Horror','Mystery','Romance','Sci-Fi','Thriller','Western']
const YEARS  = ['2020s','2010s','2000s','1990s','1980s','Pre-1980']
const RATINGS = ['9+','8+','7+','6+']
const LANGUAGES = ['English','Turkish','French','Spanish','Korean','Japanese','German','Italian']

const YEAR_RANGES = {
  '2020s':   [2020, 2099],
  '2010s':   [2010, 2019],
  '2000s':   [2000, 2009],
  '1990s':   [1990, 1999],
  '1980s':   [1980, 1989],
  'Pre-1980':[1900, 1979],
}

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function SearchPage() {
  const dispatch      = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const results       = useSelector(selectSearchResults)
  const isLoading     = useSelector(selectMoviesLoading)

  const [query, setQuery]           = useState(searchParams.get('q') || '')
  const [genre, setGenre]           = useState(null)
  const [year, setYear]             = useState(null)
  const [rating, setRating]         = useState(null)
  const [language, setLanguage]     = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const debouncedQuery = useDebounce(query, 400)
  const inputRef = useRef(null)

  const buildFilters = useCallback(() => {
    const f = {}
    if (genre)    f.genre    = genre
    if (rating)   f.rating   = parseFloat(rating)
    if (language) f.language = language
    if (year) {
      const [from, to] = YEAR_RANGES[year]
      f.yearFrom = from
      f.yearTo   = to
    }
    return f
  }, [genre, year, rating, language])

  useEffect(() => {
    if (!debouncedQuery && !genre && !year && !rating && !language) return
    setHasSearched(true)
    const filters = buildFilters()
    dispatch(setSearchQuery(debouncedQuery))
    dispatch(setFilters(filters))
    dispatch(searchMovies({ query: debouncedQuery, filters }))
    if (debouncedQuery) {
      setSearchParams({ q: debouncedQuery }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }, [debouncedQuery, genre, year, rating, language, dispatch, buildFilters, setSearchParams])

  // Focus on mount if no query
  useEffect(() => {
    if (!query) inputRef.current?.focus()
  }, [])

  const activeFilters = [genre, year, rating && `${rating} ★`, language].filter(Boolean)

  const clearAll = () => {
    setGenre(null); setYear(null); setRating(null); setLanguage(null)
    dispatch(clearFilters())
  }

  return (
    <div className={styles.page}>
      {/* Search Bar */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <SearchIcon className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Film, yönetmen veya tür ara…"
            className={styles.searchInput}
            autoComplete="off"
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => setQuery('')} aria-label="Temizle">
              <XIcon />
            </button>
          )}
          <button
            className={`${styles.filterToggle} ${filtersOpen ? styles.filterToggleActive : ''} ${activeFilters.length ? styles.filterToggleHasActive : ''}`}
            onClick={() => setFiltersOpen(v => !v)}
          >
            <FilterIcon />
            Filtrele
            {activeFilters.length > 0 && <span className={styles.filterCount}>{activeFilters.length}</span>}
          </button>
        </div>

        {/* Filter Panel */}
        {filtersOpen && (
          <div className={styles.filterPanel}>
            <FilterGroup label="Tür" options={GENRES} value={genre} onChange={setGenre} />
            <FilterGroup label="Dönem" options={YEARS}  value={year}  onChange={setYear} />
            <FilterGroup label="Puan" options={RATINGS} value={rating} onChange={setRating} />
            <FilterGroup label="Dil"  options={LANGUAGES} value={language} onChange={setLanguage} />
            {activeFilters.length > 0 && (
              <button className={styles.clearFilters} onClick={clearAll}>
                Filtreleri temizle
              </button>
            )}
          </div>
        )}

        {/* Active filter pills */}
        {activeFilters.length > 0 && !filtersOpen && (
          <div className={styles.activePills}>
            {activeFilters.map(f => (
              <span key={f} className={styles.pill}>{f}</span>
            ))}
            <button className={styles.clearPills} onClick={clearAll}>× Temizle</button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className={styles.resultsSection}>
        {isLoading && (
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`${styles.skeletonCard} skeleton`} />
            ))}
          </div>
        )}

        {!isLoading && hasSearched && results.length === 0 && (
          <div className={styles.empty}>
            <EmptyIcon />
            <h3>Sonuç bulunamadı</h3>
            <p>"{query || 'Bu filtreler'}" için eşleşen film yok. Farklı bir şey deneyin.</p>
          </div>
        )}

        {!isLoading && !hasSearched && (
          <div className={styles.emptyStart}>
            <ClapperIcon />
            <p>Aramak istediğiniz filmi yazın</p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <>
            <p className={styles.resultCount}>
              <span>{results.length}</span> sonuç bulundu
            </p>
            <div className={styles.grid}>
              {results.map(movie => (
                <MovieCard key={movie.movieId} movie={movie} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function FilterGroup({ label, options, value, onChange }) {
  return (
    <div className={styles.filterGroup}>
      <span className={styles.filterGroupLabel}>{label}</span>
      <div className={styles.filterOptions}>
        {options.map(opt => (
          <button
            key={opt}
            className={`${styles.filterOption} ${value === opt ? styles.filterOptionActive : ''}`}
            onClick={() => onChange(value === opt ? null : opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

const SearchIcon = ({ className }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
)
const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
)
const EmptyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    <path d="M8 11h6M11 8v6" strokeWidth="1.5"/>
  </svg>
)
const ClapperIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1-.3 2.1.3 2.4 1.3Z"/>
    <path d="m6.2 5.3 3.1 3.9M12.4 3.4l3.1 3.9"/>
    <path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8Z"/>
  </svg>
)