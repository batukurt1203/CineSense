import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const MovieCard = ({ movie }) => {
    // Redux'tan kullanıcı token'ını alıyoruz
    const { token } = useSelector((state) => state.auth);

    // Aksiyonlar için yerel state'ler
    const [inWatchlist, setInWatchlist] = useState(false);
    const [rating, setRating] = useState(0);

// 1. İzleme Listesine Ekle/Çıkar Fonksiyonu
    const handleToggleWatchlist = async () => {
        if (!token) {
            alert("Bu işlem için giriş yapmalısınız.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/userprofile/watchlist/${movie.id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setInWatchlist(!inWatchlist);
                alert(inWatchlist ? "Film listeden çıkarıldı." : "Film listeye eklendi!"); // Başarı mesajı
            } else {
                // Eğer 401 (Yetkisiz) veya 500 (Sunucu) hatası dönerse ekrana bas
                const errorText = await response.text();
                alert(`İşlem başarısız! Sunucu Cevabı: ${response.status} - ${errorText}`);
            }
        } catch (err) {
            alert(`Ağ/Bağlantı Hatası: ${err.message}`);
        }
    };

    // 2. Filme Puan Verme Fonksiyonu
    const handleRate = async (score) => {
        if (!token) {
            alert("Bu işlem için giriş yapmalısınız.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/userprofile/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ movieId: movie.id, score: score })
            });

            if (response.ok) {
                setRating(score);
                alert(`Filme ${score} puan verdiniz!`);
            } else {
                const errorText = await response.text();
                alert(`Puanlama başarısız! Sunucu Cevabı: ${response.status} - ${errorText}`);
            }
        } catch (err) {
            alert(`Ağ/Bağlantı Hatası: ${err.message}`);
        }
    };

    return (
        <div style={styles.card}>
            <h3>{movie.title}</h3>
            <p style={styles.genres}>{movie.genres}</p>
            <p style={styles.overview}>{movie.overview?.substring(0, 100)}...</p>

            {/* ETKİLEŞİM BUTONLARI */}
            <div style={styles.actions}>

                {/* İzleme Listesi Butonu */}
                <button
                    onClick={handleToggleWatchlist}
                    style={{...styles.watchlistBtn, backgroundColor: inWatchlist ? '#dc3545' : '#28a745'}}
                >
                    {inWatchlist ? '➖ Listeden Çıkar' : '➕ Listeye Ekle'}
                </button>

                {/* Yıldızlı Puanlama Alanı */}
                <div style={styles.ratingSection}>
                    <span style={{ fontSize: '14px', marginRight: '5px' }}>Puanla:</span>
                    {[1, 2, 3, 4, 5].map(num => (
                        <span
                            key={num}
                            onClick={() => handleRate(num)}
                            style={{
                                cursor: 'pointer',
                                color: num <= rating ? '#f39c12' : '#e0e0e0',
                                fontSize: '24px'
                            }}
                        >
                            ★
                        </span>
                    ))}
                </div>

            </div>
        </div>
    );
};

const styles = {
    card: {
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    },
    genres: {
        fontSize: '12px',
        color: '#6c757d',
        fontStyle: 'italic'
    },
    overview: {
        fontSize: '14px',
        marginBottom: '15px'
    },
    actions: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #eee',
        paddingTop: '15px'
    },
    watchlistBtn: {
        color: '#fff',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    ratingSection: {
        display: 'flex',
        alignItems: 'center'
    }
};

export default MovieCard;