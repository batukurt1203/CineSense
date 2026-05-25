import React, { useState } from 'react';
import { getRecommendation } from '../api/appClient';
import SearchBar from './SearchBar';

const Questionnaire = ({ onRecommendationReceived }) => {
    // Artık seçilen filmleri (ID ve İsim olarak) bir listede tutuyoruz. Başlangıçta boş.
    const [selectedMovies, setSelectedMovies] = useState([]);
    const [mood, setMood] = useState('Heyecanlı');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleMovieAdd = (movie) => {
        // Aynı filmi iki kez eklemeyi engellemek için kontrol yapıyoruz
        if (!selectedMovies.find(m => m.id === movie.id)) {
            setSelectedMovies([...selectedMovies, { id: movie.id, title: movie.title }]);
        }
    };

    const handleMovieRemove = (idToRemove) => {
        setSelectedMovies(selectedMovies.filter(m => m.id !== idToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Eğer kullanıcı hiç film seçmediyse uyarı ver ve işlemi durdur
        if (selectedMovies.length === 0) {
            setError("Lütfen en az bir favori film seçin.");
            return;
        }

        setLoading(true);
        setError('');

        const userProfile = {
            currentMood: mood,
            availableTimeMinutes: 120,
            socialContext: 'Arkadaşlarla'
        };

        // C# tarafına sadece filmlerin ID'lerini bir dizi [123, 456] olarak gönderiyoruz
        const movieIds = selectedMovies.map(m => m.id);

        try {
            const result = await getRecommendation(movieIds, userProfile);
            onRecommendationReceived(result);
        } catch (err) {
            console.error("💥 Detaylı Hata Kodu:", err);
            if (err.response) {
                console.error("💥 C# Sunucusundan Gelen Cevap:", err.response.data);
            }
            setError('Film önerisi alınamadı. Lütfen bağlantıları kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#fff' }}>

            <h3 style={{ marginTop: 0 }}>Favori Filmlerini Ekle</h3>
            <SearchBar onMovieSelect={handleMovieAdd} />

            {/* Seçilen filmleri küçük etiketler halinde gösteriyoruz */}
            <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {selectedMovies.map(movie => (
                    <span
                        key={movie.id}
                        style={{
                            backgroundColor: '#3498db',
                            color: 'white',
                            padding: '5px 10px',
                            borderRadius: '15px',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {movie.title}
                        <button
                            type="button"
                            onClick={() => handleMovieRemove(movie.id)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                padding: 0,
                                fontSize: '16px'
                            }}
                        >
                            ×
                        </button>
                    </span>
                ))}
            </div>

            <h3>Ruh Halini Seç</h3>
            <form onSubmit={handleSubmit}>
                <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    style={{ padding: '8px', marginBottom: '15px', width: '100%', borderRadius: '5px', border: '1px solid #ccc' }}
                >
                    <option value="Heyecanlı">Heyecanlı / Aksiyon Bekleyen</option>
                    <option value="Düşünceli">Düşünceli / Felsefi</option>
                    <option value="Eğlenceli">Eğlenceli / Neşeli</option>
                </select>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        backgroundColor: '#2ecc71',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        width: '100%',
                        fontWeight: 'bold'
                    }}
                >
                    {loading ? 'Yapay Zeka Düşünüyor...' : 'Bana Film Öner'}
                </button>
            </form>
            {error && <p style={{ color: '#e74c3c', marginTop: '15px', fontWeight: 'bold' }}>{error}</p>}
        </div>
    );
};

export default Questionnaire;