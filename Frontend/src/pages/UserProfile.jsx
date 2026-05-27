import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const UserProfile = () => {
    const { token } = useSelector((state) => state.auth);

    const [profileData, setProfileData] = useState({ watchlist: [], history: [], ratings: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/userprofile/my-profile', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Profil verileri alınamadı.');
                }

                const data = await response.json();
                setProfileData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchProfileData();
        }
    }, [token]);

    // Kullanıcı giriş yapmamışsa ana sayfaya yönlendir
    if (!token) {
        return <Navigate to="/" />;
    }

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Yükleniyor...</div>;
    if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>Hata: {error}</div>;

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ borderBottom: '3px solid #007BFF', paddingBottom: '10px', marginBottom: '30px' }}>
                👤 Profilim
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

                {/* İZLEME LİSTESİ */}
                <section>
                    <h2 style={{ color: '#343a40' }}>📌 İzleme Listem ({profileData.watchlist.length})</h2>
                    <div style={styles.movieGrid}>
                        {profileData.watchlist.length > 0 ? profileData.watchlist.map(movie => (
                            <div key={movie.id} style={styles.movieCard}>
                                <h4>{movie.title}</h4>
                                <p style={styles.movieGenre}>{movie.genres}</p>
                            </div>
                        )) : <p>İzleme listeniz şu an boş.</p>}
                    </div>
                </section>

                <hr style={{ border: '1px solid #dee2e6' }} />

                {/* İZLEME GEÇMİŞİ */}
                <section>
                    <h2 style={{ color: '#343a40' }}>🕒 İzleme Geçmişim ({profileData.history.length})</h2>
                    <div style={styles.movieGrid}>
                        {profileData.history.length > 0 ? profileData.history.map(movie => (
                            <div key={movie.id} style={styles.movieCard}>
                                <h4>{movie.title}</h4>
                                <p style={styles.movieGenre}>{movie.genres}</p>
                            </div>
                        )) : <p>Henüz izleme geçmişiniz bulunmuyor.</p>}
                    </div>
                </section>

                <hr style={{ border: '1px solid #dee2e6' }} />

                {/* PUANLAMALAR */}
                <section>
                    <h2 style={{ color: '#343a40' }}>⭐ Değerlendirmelerim ({profileData.ratings.length})</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {profileData.ratings.length > 0 ? profileData.ratings.map((rating, index) => (
                            <div key={index} style={styles.ratingCard}>
                                <span style={{ fontWeight: 'bold' }}>{rating.title}</span>
                                <span style={{ color: '#f39c12', fontWeight: 'bold' }}>{rating.score} / 5</span>
                            </div>
                        )) : <p>Henüz bir filme puan vermediniz.</p>}
                    </div>
                </section>

            </div>
        </div>
    );
};

const styles = {
    movieGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '20px',
        marginTop: '15px'
    },
    movieCard: {
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    movieGenre: {
        fontSize: '12px',
        color: '#6c757d',
        marginTop: '5px'
    },
    ratingCard: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa',
        maxWidth: '500px'
    }
};

export default UserProfile;