import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
    // Redux'tan kullanıcının rolünü ve biletini (token) alıyoruz
    const { role, token } = useSelector((state) => state.auth);

    // Ekranda gösterilecek canlı veriler ve durumlar için State'ler
    const [stats, setStats] = useState({ totalUsers: 0, totalMovies: 0, aiStatus: 'Yükleniyor...' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Veritabanı tohumlama (Seeding) işlemi için özel State'ler
    const [seeding, setSeeding] = useState(false);
    const [message, setMessage] = useState(null);

    // İstatistikleri arka plandan (C#) çeken ana fonksiyon
    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/stats', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Veriler çekilirken bir hata oluştu veya yetkiniz reddedildi.');
            }

            const data = await response.json();
            setStats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Sayfa yüklendiğinde ve sadece Admin giriş yaptığında istatistikleri çek
    useEffect(() => {
        if (role === 'Admin') {
            fetchStats();
        }
    }, [role, token]);

    // [YENİ] TMDB'den toplu film indirme işlemini başlatan fonksiyon
    const handleSeedMovies = async () => {
        setSeeding(true);
        setMessage("Filmler TMDB'den indiriliyor, bu işlem 1-2 dakika sürebilir. Lütfen bekleyin...");

        try {
            // C# tarafındaki seed uç noktasına istek atıyoruz (25 sayfa = 500 film hedefi)
            const response = await fetch('http://localhost:5000/api/admin/seed-movies?pages=25', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Film indirme işlemi sırasında sunucuda bir hata oluştu.');
            }

            const data = await response.json();
            setMessage(`✅ İşlem tamamlandı: ${data.message}`);

            // İşlem bittikten sonra ekrandaki güncel film sayısını görmek için verileri tekrar çek
            fetchStats();
        } catch (err) {
            setMessage(`❌ Hata: ${err.message}`);
        } finally {
            setSeeding(false);
        }
    };

    // Güvenlik Koruması: Eğer kişi Admin değilse, onu zorla Ana Sayfaya yolla
    if (role !== 'Admin') {
        return <Navigate to="/" />;
    }

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ borderBottom: '3px solid #dc3545', paddingBottom: '10px' }}>
                ⚙️ Sistem Yönetim Paneli
            </h1>
            <p>Hoş geldin Yönetici. CineSense motorunun kontrolü sende.</p>

            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>Hata: {error}</p>}

            {/* İstatistik Kartları */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
                <div style={styles.statCard}>
                    <h3>Toplam Kullanıcı</h3>
                    <p style={styles.statNumber}>
                        {loading ? '...' : stats.totalUsers}
                    </p>
                </div>
                <div style={styles.statCard}>
                    <h3>Sistemdeki Filmler</h3>
                    <p style={styles.statNumber}>
                        {loading ? '...' : stats.totalMovies}
                    </p>
                </div>
                <div style={styles.statCard}>
                    <h3>Yapay Zeka Durumu</h3>
                    <p style={{ color: stats.aiStatus === 'Aktif' ? 'green' : 'orange', fontSize: '24px', fontWeight: 'bold', margin: '15px 0' }}>
                        {loading ? '...' : stats.aiStatus}
                    </p>
                </div>
            </div>

            {/* Veri Tohumlama (Seeding) Kontrol Alanı */}
            <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                <h3>🚀 Yapay Zeka Veri Havuzunu Genişlet</h3>
                <p>Yapay zekanın daha tutarlı ve geniş bir yelpazede öneriler yapabilmesi için TMDB üzerinden en popüler filmleri sisteme otomatik olarak çekebilirsiniz. Bu işlem mevcut filmlerinizi silmez, sadece eksik olanları tamamlar.</p>

                <button
                    onClick={handleSeedMovies}
                    disabled={seeding}
                    style={{ ...styles.button, backgroundColor: seeding ? '#6c757d' : '#28a745', cursor: seeding ? 'not-allowed' : 'pointer' }}
                >
                    {seeding ? 'İndiriliyor (Lütfen Bekleyin)...' : 'Veritabanına ~500 Yeni Film Ekle'}
                </button>

                {message && (
                    <p style={{ marginTop: '15px', fontSize: '16px', fontWeight: 'bold', color: message.includes('✅') ? 'green' : (message.includes('❌') ? 'red' : '#007BFF') }}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

const styles = {
    statCard: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        flex: '1',
        textAlign: 'center'
    },
    statNumber: {
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#007BFF',
        margin: '10px 0'
    },
    button: {
        color: '#fff',
        border: 'none',
        padding: '12px 24px',
        fontSize: '16px',
        borderRadius: '5px',
        fontWeight: 'bold',
        transition: 'background-color 0.3s'
    }
};

export default AdminDashboard;