import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status, error, user } = useSelector((state) => state.auth);

    // Eğer kullanıcı zaten giriş yapmışsa, onu doğrudan eşleştiriciye yönlendir
    useEffect(() => {
        if (user) {
            navigate('/matchmaker');
        }
    }, [user, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(loginUser({ email, password }));
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Tekrar Hoş Geldin</h2>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        type="email"
                        placeholder="E-posta Adresi"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Şifre"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        required
                    />

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        style={{...styles.button, opacity: status === 'loading' ? 0.7 : 1}}
                    >
                        {status === 'loading' ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>

                {status === 'failed' && <p style={styles.errorText}>Hata: {error}</p>}

                <p style={styles.footerText}>
                    Henüz hesabın yok mu? <Link to="/register" style={styles.link}>Kayıt Ol</Link>
                </p>
            </div>
        </div>
    );
};

// Register.jsx ile aynı stilleri kullanıyoruz
const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' },
    card: { backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' },
    button: { padding: '12px', backgroundColor: '#007BFF', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
    errorText: { color: 'red', textAlign: 'center', marginTop: '15px' },
    footerText: { textAlign: 'center', marginTop: '20px', color: '#666' },
    link: { color: '#007BFF', textDecoration: 'none', fontWeight: 'bold' }
};

export default Login;