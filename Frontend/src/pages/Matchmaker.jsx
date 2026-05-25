import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecommendations } from '../redux/slices/recommendationSlice';
import SearchBar from '../components/SearchBar';
import MovieCard from '../components/MovieCard';

const Matchmaker = () => {
    const dispatch = useDispatch();

    const { recommendations, status, error } = useSelector((state) => state.recommendations);

    const [favoriteMovies, setFavoriteMovies] = useState([]);
    const [mood, setMood] = useState('Heyecanlı'); // Questionnaire yerine sadece mood tutuyoruz

    const handleAddFavorite = (movie) => {
        if (!favoriteMovies.find(m => m.id === movie.id)) {
            setFavoriteMovies([...favoriteMovies, movie]);
        }
    };

    const handleGenerateRecommendations = () => {
        if (favoriteMovies.length === 0) {
            alert("Lütfen en az bir favori film seçin!");
            return;
        }

        const favoriteMovieIds = favoriteMovies.map(m => m.id);

        // Yapay zekaya gidecek profili burada hazırlıyoruz
        const moodProfile = {
            currentMood: mood,
            availableTimeMinutes: 120,
            socialContext: 'Arkadaşlarla'
        };

        dispatch(fetchRecommendations({ favoriteMovieIds, moodProfile }));
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2>Film Eşleştirici (Matchmaker)</h2>

            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>

                {/* Sol Sütun: Girdi Alanları */}
                <div style={{ flex: '1', minWidth: '300px' }}>

                    {/* Adım 1: Favori Filmler */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3>1. Sevdiğiniz Filmleri Ekleyin</h3>
                        <SearchBar onMovieSelect={handleAddFavorite} />

                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                            {favoriteMovies.map((movie) => (
                                <li key={movie.id} style={styles.listItem}>
                                    {movie.title}
                                    <button
                                        onClick={() => setFavoriteMovies(favoriteMovies.filter(m => m.id !== movie.id))}
                                        style={styles.deleteButton}
                                    >
                                        Kaldır
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Adım 2: Ruh Hali Anketi (Temizlendi) */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3>2. Ruh Halinizi Belirleyin</h3>
                        <select
                            value={mood}
                            onChange={(e) => setMood(e.target.value)}
                            style={{ padding: '10px', width: '100%', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px' }}
                        >
                            <option value="Heyecanlı">Heyecanlı / Aksiyon Bekleyen</option>
                            <option value="Düşünceli">Düşünceli / Felsefi</option>
                            <option value="Eğlenceli">Eğlenceli / Neşeli</option>
                        </select>
                    </div>

                    {/* Adım 3: İşlemi Başlat */}
                    <button
                        onClick={handleGenerateRecommendations}
                        disabled={status === 'loading'}
                        style={{...styles.generateButton, opacity: status === 'loading' ? 0.7 : 1}}
                    >
                        {status === 'loading' ? 'Yapay Zeka Düşünüyor...' : 'Önerileri Getir'}
                    </button>

                    {status === 'failed' && <p style={{ color: 'red', marginTop: '10px' }}>Hata: {error}</p>}
                </div>

                {/* Sağ Sütun: Öneri Sonuçları */}
                <div style={{ flex: '2', minWidth: '400px' }}>
                    <h3>Senin İçin Seçilenler</h3>

                    {status === 'idle' && <p style={{ color: '#666' }}>Önerileri görmek için seçimlerinizi yapın ve butona tıklayın.</p>}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                        {recommendations && recommendations.length > 0 ? (
                            recommendations.map((result, index) => (
                                <MovieCard key={result.id || index} movie={result} />
                            ))
                        ) : status === 'succeeded' ? (
                            <p>Uygun film bulunamadı.</p>
                        ) : null}
                    </div>
                </div>

            </div>
        </div>
    );
};

const styles = {
    listItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px',
        backgroundColor: '#f1f1f1',
        marginBottom: '8px',
        borderRadius: '4px'
    },
    deleteButton: {
        backgroundColor: 'red',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    generateButton: {
        width: '100%',
        padding: '15px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '20px'
    }
};

export default Matchmaker;