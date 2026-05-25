import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecommendations } from '../redux/slices/recommendationSlice';
import SearchBar from '../components/SearchBar';
import MovieCard from '../components/MovieCard';

const WatchParty = () => {
    const dispatch = useDispatch();
    const { recommendations, status, error } = useSelector((state) => state.recommendations);

    // Başlangıçta 2 kullanıcı ile (Kişi 1 ve Kişi 2) bir Watch Party başlatıyoruz.
    const [partyMembers, setPartyMembers] = useState([
        { id: 1, name: '1. Kişi', favorites: [] },
        { id: 2, name: '2. Kişi', favorites: [] }
    ]);

    // Yeni bir arkadaş eklemek için (Maksimum 4 kişi ile sınırlandırabiliriz)
    const handleAddMember = () => {
        if (partyMembers.length < 4) {
            const newId = partyMembers.length + 1;
            setPartyMembers([...partyMembers, { id: newId, name: `${newId}. Kişi`, favorites: [] }]);
        }
    };

    // Belirli bir kişiye favori film ekleme
    const handleAddFavorite = (memberId, movie) => {
        setPartyMembers(partyMembers.map(member => {
            if (member.id === memberId) {
                // Aynı filmi iki kez eklemesini engelle
                if (!member.favorites.find(m => m.id === movie.id)) {
                    return { ...member, favorites: [...member.favorites, movie] };
                }
            }
            return member;
        }));
    };

    // Belirli bir kişinin favori listesinden film çıkarma
    const handleRemoveFavorite = (memberId, movieId) => {
        setPartyMembers(partyMembers.map(member => {
            if (member.id === memberId) {
                return { ...member, favorites: member.favorites.filter(m => m.id !== movieId) };
            }
            return member;
        }));
    };

    // Tüm grubun ortak zevkine göre öneri getirme
    const handleGeneratePartyRecommendations = () => {
        // 1. Tüm üyelerin favori filmlerini tek bir listede topla (Düzleştir - Flatten)
        const allFavorites = partyMembers.flatMap(member => member.favorites);

        if (allFavorites.length === 0) {
            alert("Lütfen en az bir kişi favori filmlerini seçsin!");
            return;
        }

        // 2. Aynı filmi birden fazla kişi seçmiş olabilir, ID'leri benzersiz (unique) hale getir
        const uniqueMovieIds = [...new Set(allFavorites.map(m => m.id))];

        // 3. Ortak listeyi Redux üzerinden API'ye gönder
        // AI motorumuz (Content-Based) tüm bu filmlerin vektörlerinin ortalamasını alacağı için 
        // otomatik olarak grubun ortak zevkini yansıtan filmleri bulacaktır!
        dispatch(fetchRecommendations({
            favoriteMovieIds: uniqueMovieIds,
            moodProfile: { currentMood: "Grup İzlemesi", availableTimeMinutes: 120, socialContext: "Friends" }
        }));
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2>🍿 Watch Party (Grup Eşleştirici)</h2>
                <p style={{ color: '#666' }}>
                    Arkadaşlarınızla veya ailenizle ne izleyeceğinize karar veremiyor musunuz?
                    Herkes kendi favorilerini eklesin, CineSense ortak zevkinizi bulsun.
                </p>
            </div>

            <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
                {/* Kullanıcı Kartları (Yan yana dizilir) */}
                {partyMembers.map((member) => (
                    <div key={member.id} style={styles.memberCard}>
                        <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>{member.name}</h3>

                        <SearchBar onMovieSelect={(movie) => handleAddFavorite(member.id, movie)} />
                        
                        <ul style={{ listStyleType: 'none', padding: 0, minHeight: '150px' }}>
                            {member.favorites.length === 0 && <p style={{ color: '#aaa', fontSize: '14px' }}>Henüz film seçilmedi.</p>}

                            {member.favorites.map((movie) => (
                                <li key={movie.id} style={styles.listItem}>
                                    <span style={{ fontSize: '14px' }}>{movie.title}</span>
                                    <button onClick={() => handleRemoveFavorite(member.id, movie.id)} style={styles.deleteButton}>X</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                {/* Yeni Kişi Ekleme Butonu */}
                {partyMembers.length < 4 && (
                    <div style={{...styles.memberCard, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9', border: '2px dashed #ccc'}}>
                        <button onClick={handleAddMember} style={styles.addMemberButton}>+ Kişi Ekle</button>
                    </div>
                )}
            </div>

            {/* Ortak Karar Butonu */}
            <div style={{ textAlign: 'center', margin: '40px 0' }}>
                <button
                    onClick={handleGeneratePartyRecommendations}
                    disabled={status === 'loading'}
                    style={{...styles.generateButton, opacity: status === 'loading' ? 0.7 : 1}}
                >
                    {status === 'loading' ? 'Ortak Zevkler Hesaplanıyor...' : 'Grup İçin Film Bul'}
                </button>
                {status === 'failed' && <p style={{ color: 'red' }}>Hata: {error}</p>}
            </div>

            {/* Sonuçlar */}
            {status === 'succeeded' && (
                <div>
                    <h3 style={{ textAlign: 'center' }}>Grubunuz İçin Seçilen Filmler</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                        {recommendations.map((movie, index) => (
                            <MovieCard key={movie.id || index} movie={movie} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    memberCard: {
        minWidth: '300px',
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #eaeaea',
        flex: '0 0 auto' // Yatay kaydırma için
    },
    listItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px',
        backgroundColor: '#f1f1f1',
        marginBottom: '6px',
        borderRadius: '4px'
    },
    deleteButton: {
        backgroundColor: '#ff4d4f',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        padding: '4px 8px',
        fontWeight: 'bold'
    },
    addMemberButton: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#007BFF',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer'
    },
    generateButton: {
        padding: '15px 40px',
        backgroundColor: '#6f42c1', // Farklı bir renk (Mor) verelim ki normal Matchmaker'dan ayrılsın
        color: '#fff',
        border: 'none',
        borderRadius: '30px',
        fontSize: '20px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(111, 66, 193, 0.4)'
    }
};

export default WatchParty;