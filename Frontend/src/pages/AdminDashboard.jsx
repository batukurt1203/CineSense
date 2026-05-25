import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
    // Redux'tan kullanıcının rolünü alıyoruz
    const { role } = useSelector((state) => state.auth);

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

            <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
                <div style={styles.statCard}>
                    <h3>Toplam Kullanıcı</h3>
                    <p style={styles.statNumber}>1</p>
                </div>
                <div style={styles.statCard}>
                    <h3>Sistemdeki Filmler</h3>
                    <p style={styles.statNumber}>142</p>
                </div>
                <div style={styles.statCard}>
                    <h3>Yapay Zeka Durumu</h3>
                    <p style={{ color: 'green', fontSize: '24px', fontWeight: 'bold' }}>Aktif</p>
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