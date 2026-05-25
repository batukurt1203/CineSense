import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            {/* Karşılama Alanı (Hero Section) */}
            <div style={styles.hero}>
                <h1 style={styles.title}>CineSense'e Hoş Geldin</h1>
                <p style={styles.subtitle}>
                    Yapay zeka destekli kişisel sinema rehberin. Ne izleyeceğine karar veremiyor musun?
                    Hemen sana en uygun eşleştiriciyi seç ve film geceni başlat.
                </p>
            </div>

            {/* Yönlendirme Kartları */}
            <div style={styles.cardsContainer}>

                {/* Bireysel Eşleştirici Kartı */}
                <div
                    style={styles.card}
                    onClick={() => navigate('/matchmaker')}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-10px)';
                        e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 123, 255, 0.1)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.05)';
                    }}
                >
                    <div style={styles.icon}>🎬</div>
                    <h2 style={styles.cardTitle}>Tek Başına İzle</h2>
                    <p style={styles.cardText}>
                        Kendi zevkine ve anlık ruh haline en uygun filmi saniyeler içinde bul.
                    </p>
                </div>

                {/* Watch Party Kartı */}
                <div
                    style={styles.card}
                    onClick={() => navigate('/watch-party')}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-10px)';
                        e.currentTarget.style.boxShadow = '0 15px 30px rgba(111, 66, 193, 0.1)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.05)';
                    }}
                >
                    <div style={styles.icon}>🍿</div>
                    <h2 style={styles.cardTitle}>Arkadaşlarla İzle</h2>
                    <p style={styles.cardText}>
                        Gruptaki herkesin favorilerini birleştir, ortak zevkinizi yansıtan filmi keşfet.
                    </p>
                </div>

            </div>
        </div>
    );
};

// Basit, modern ve sade stiller
const styles = {
    container: {
        padding: '80px 20px',
        maxWidth: '1000px',
        margin: '0 auto',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    hero: {
        marginBottom: '60px'
    },
    title: {
        fontSize: '3.5em',
        color: '#2c3e50',
        marginBottom: '15px',
        fontWeight: 'bold'
    },
    subtitle: {
        fontSize: '1.2em',
        color: '#7f8c8d',
        maxWidth: '600px',
        margin: '0 auto',
        lineHeight: '1.6'
    },
    cardsContainer: {
        display: 'flex',
        justifyContent: 'center',
        gap: '40px',
        flexWrap: 'wrap'
    },
    card: {
        flex: '1',
        minWidth: '280px',
        maxWidth: '400px',
        padding: '50px 30px',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        border: '1px solid #eaeaea',
        transition: 'all 0.3s ease',
        textAlign: 'center'
    },
    icon: {
        fontSize: '5em',
        marginBottom: '20px'
    },
    cardTitle: {
        color: '#2c3e50',
        marginBottom: '15px',
        fontSize: '1.8em'
    },
    cardText: {
        color: '#7f8c8d',
        lineHeight: '1.5',
        fontSize: '1.1em'
    }
};

export default Home;