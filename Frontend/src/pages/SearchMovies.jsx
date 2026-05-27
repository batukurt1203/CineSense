import React, { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';

const SearchMovies = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('default'); // YENİ: Sıralama state'i
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        handleSearch('', 'default');
    }, []);

    const handleSearch = async (query, sortOrder) => {
        setLoading(true);
        try {
            // URL'ye sortBy parametresini de dahil ediyoruz
            const response = await fetch(`http://localhost:5000/api/movie/search?query=${query}&sortBy=${sortOrder}`);
            const data = await response.json();
            setMovies(data);
        } catch (error) {
            console.error("Arama hatası:", error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        handleSearch(searchTerm, sortBy);
    };

    // Açılır menü değiştiğinde tetiklenir ve anında sonuçları günceller
    const handleSortChange = (e) => {
        const newSort = e.target.value;
        setSortBy(newSort);
        handleSearch(searchTerm, newSort);
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ borderBottom: '3px solid #17a2b8', paddingBottom: '10px' }}>🔍 Filmleri Keşfet</h1>

            <form onSubmit={onSubmit} style={{ display: 'flex', gap: '10px', marginTop: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Film adı veya türü (Örn: Aksiyon, Matrix, Avatar)..."
                    style={{ flex: '1 1 300px', padding: '12px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
                />

                {/* YENİ: SIRALAMA AÇILIR MENÜSÜ */}
                <select
                    value={sortBy}
                    onChange={handleSortChange}
                    style={{ padding: '12px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#fff' }}
                >
                    <option value="default">Önerilen (Varsayılan)</option>
                    <option value="rating_desc">⭐ En Yüksek Puanlılar</option>
                    <option value="year_desc">📅 En Yeniler</option>
                    <option value="year_asc">⏳ En Eskiler</option>
                    <option value="title_asc">🔤 İsim (A-Z)</option>
                    <option value="title_desc">🔤 İsim (Z-A)</option>
                </select>

                <button type="submit" style={styles.button}>Ara / Filtrele</button>
            </form>

            {loading ? (
                <div style={{ textAlign: 'center', fontSize: '18px' }}>Sonuçlar Yükleniyor...</div>
            ) : (
                <div style={styles.grid}>
                    {movies.length > 0 ? (
                        movies.map(movie => <MovieCard key={movie.id} movie={movie} />)
                    ) : (
                        <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>Aradığınız kritere uygun film bulunamadı.</p>
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    button: { padding: '12px 24px', fontSize: '16px', backgroundColor: '#17a2b8', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }
};

export default SearchMovies;