import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './redux/slices/authSlice';

import Home from './pages/Home';
import Matchmaker from './pages/Matchmaker';
import WatchParty from './pages/WatchParty';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard'; // Admin sayfasını ekledik

function App() {
    // Redux'tan user (kullanıcı adı) ve role (Admin/User) bilgilerini çekiyoruz
    const { user, role } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <Router>
            <div style={styles.appContainer}>
                <header style={styles.header}>
                    <div style={styles.brandContainer}>
                        <Link to="/" style={styles.logoLink}>
                            <span role="img" aria-label="movie">🎬</span> CineSense
                        </Link>
                    </div>

                    <nav style={styles.navLinks}>
                        <Link to="/" style={styles.navLink}>Ana Sayfa</Link>
                        <Link to="/matchmaker" style={styles.navLink}>Bireysel Eşleştirici</Link>
                        <Link to="/watch-party" style={styles.navLinkParty}>🍿 Watch Party</Link>

                        {/* KULLANICI GİRİŞ YAPTIYSA TEK BİR DİV İÇİNDE GÖSTERİLİR */}
                        {user ? (
                            <div style={styles.userMenu}>
                                {/* Sadece Admin olanlara görünecek buton */}
                                {role === 'Admin' && (
                                    <Link to="/admin" style={{ color: '#ffc107', fontWeight: 'bold', marginRight: '15px', textDecoration: 'none' }}>
                                        ⚙️ Yönetim Paneli
                                    </Link>
                                )}
                                <span style={styles.welcomeText}>Hoş geldin, <b>{user}</b></span>
                                <button onClick={handleLogout} style={styles.logoutButton}>Çıkış Yap</button>
                            </div>
                        ) : (
                            // KULLANICI GİRİŞ YAPMADIYSA
                            <div style={styles.authLinks}>
                                <Link to="/login" style={styles.navLink}>Giriş Yap</Link>
                                <Link to="/register" style={styles.registerButton}>Kayıt Ol</Link>
                            </div>
                        )}
                    </nav>
                </header>

                <main style={styles.mainContent}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/matchmaker" element={<Matchmaker />} />
                        <Route path="/watch-party" element={<WatchParty />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/admin" element={<AdminDashboard />} /> {/* Admin rotasını ekledik */}
                    </Routes>
                </main>

                <footer style={styles.footer}>
                    <p>© 2026 CineSense - AI-Powered Movie Matchmaker. Tüm Hakları Saklıdır.</p>
                </footer>
            </div>
        </Router>
    );
}

const styles = {
    appContainer: { fontFamily: "'Inter', sans-serif", backgroundColor: '#f4f4f9', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#333' },
    header: { backgroundColor: '#111', color: '#fff', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 1000 },
    brandContainer: { fontSize: '24px', fontWeight: 'bold' },
    logoLink: { color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' },
    navLinks: { display: 'flex', alignItems: 'center', gap: '25px' },
    navLink: { color: '#ccc', textDecoration: 'none', fontSize: '16px', fontWeight: '500', transition: 'color 0.2s', cursor: 'pointer' },
    navLinkParty: { color: '#fff', backgroundColor: '#6f42c1', padding: '8px 16px', borderRadius: '20px', textDecoration: 'none', fontSize: '15px', fontWeight: 'bold', boxShadow: '0 2px 6px rgba(111, 66, 193, 0.3)' },
    userMenu: { display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '1px solid #333', paddingLeft: '25px', marginLeft: '10px' },
    welcomeText: { color: '#fff', fontSize: '14px' },
    logoutButton: { backgroundColor: 'transparent', border: '1px solid #ff4d4f', color: '#ff4d4f', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
    authLinks: { display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '1px solid #333', paddingLeft: '25px', marginLeft: '10px' },
    registerButton: { backgroundColor: '#007BFF', color: '#fff', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '15px', fontWeight: 'bold' },
    mainContent: { flex: 1, padding: '40px 20px', backgroundColor: '#f8f9fa' },
    footer: { backgroundColor: '#111', color: '#666', textAlign: 'center', padding: '15px 20px', fontSize: '14px', borderTop: '1px solid #222' }
};

export default App;