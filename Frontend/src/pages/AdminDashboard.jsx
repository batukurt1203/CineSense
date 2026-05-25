import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
    // Redux'tan kullanıcının rolünü ve biletini (token) alıyoruz
    const { role, token } = useSelector((state) => state.auth);

    // Ekranda gösterilecek canlı veriler için State'ler
    const [stats, setStats] = useState({ totalUsers: 0, totalMovies: 0, aiStatus: 'Yükleniyor...' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Sadece admin ise veri çekmeye çalış
        if (role === 'Admin') {
            const fetchStats = async () => {
                try {
                    const response = await fetch('http://localhost:5000/api/admin/stats', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            // C# tarafındaki [Authorize] kilidini açmak için biletimizi gönderiyoruz
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

            fetchStats();
        }
    }, [role, token]);

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
        </div>
    );
};

const styles = {
    statCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', flex: '1', textAlign: 'center' },
    statNumber: { fontSize: '36px', fontWeight: 'bold', color: '#007BFF', margin: '10px 0' }
};

export default AdminDashboard;