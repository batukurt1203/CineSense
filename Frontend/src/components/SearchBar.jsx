import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SearchBar = ({ onMovieSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [draftMovie, setDraftMovie] = useState(null); // Butona basılana kadar filmi beklettiğimiz alan

    // Kendi TMDB API Anahtarını buraya yazmalısın
    const TMDB_API_KEY = '7412167ebc9ae2b29fbad93167a347c6';

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            // Eğer kullanıcı listeden bir film seçtiyse (draftMovie doluysa) tekrar arama yapma
            if (query.length > 2 && !draftMovie) {
                setIsSearching(true);
                try {
                    const response = await axios.get(
                        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=tr-TR&query=${query}&page=1`
                    );
                    setResults(response.data.results.slice(0, 5));
                } catch (error) {
                    console.error("TMDB'de film aranırken hata oluştu:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query, TMDB_API_KEY, draftMovie]);

    // Listeden filme tıklandığında inputa ismini yaz ve bekleme (draft) state'ine al
    const handleMoviePick = (movie) => {
        setQuery(movie.title);
        setDraftMovie(movie);
        setResults([]); // Listeyi kapat
    };

    // Ekle butonuna basıldığında ankete gönder
    const handleAddClick = () => {
        if (draftMovie) {
            onMovieSelect(draftMovie);
            setQuery(''); // Inputu temizle
            setDraftMovie(null); // Bekleyen filmi sıfırla
        }
    };

    return (
        <div style={{ position: 'relative', marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
                <input
                    type="text"
                    placeholder="Örnek: Yüzüklerin Efendisi..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setDraftMovie(null); // Kullanıcı silip baştan yazarsa seçimi iptal et
                    }}
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box'
                    }}
                />

                {isSearching && <p style={{ position: 'absolute', fontSize: '12px', color: '#888', marginTop: '5px' }}>Aranıyor...</p>}

                {results.length > 0 && (
                    <ul style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 1000,
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        {results.map((movie) => (
                            <li
                                key={movie.id}
                                onClick={() => handleMoviePick(movie)}
                                style={{
                                    padding: '10px',
                                    borderBottom: '1px solid #eee',
                                    cursor: 'pointer'
                                }}
                            >
                                {movie.title} <span style={{ fontSize: '12px', color: '#888' }}>({movie.release_date?.substring(0, 4)})</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Geri Getirdiğimiz Ekle Butonu */}
            <button
                type="button"
                onClick={handleAddClick}
                disabled={!draftMovie} // Eğer listeden bir film seçilmediyse buton pasif olur
                style={{
                    padding: '10px 20px',
                    backgroundColor: draftMovie ? '#3498db' : '#bdc3c7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: draftMovie ? 'pointer' : 'not-allowed',
                    fontWeight: 'bold',
                    transition: 'background-color 0.2s'
                }}
            >
                Ekle
            </button>
        </div>
    );
};

export default SearchBar;