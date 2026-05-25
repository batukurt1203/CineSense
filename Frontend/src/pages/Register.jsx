import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../redux/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status, error } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Redux action'ını çalıştır ve sonucunu bekle
        const resultAction = await dispatch(registerUser({ username, email, password }));

        // Eğer kayıt başarılıysa giriş sayfasına yönlendir
        if (registerUser.fulfilled.match(resultAction)) {
            navigate('/login');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Aramıza Katıl</h2>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        type="text"
                        placeholder="Kullanıcı Adı"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={styles.input}
                        required
                    />
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
                        {status === 'loading' ? 'Kaydediliyor...' : 'Kayıt Ol'}
                    </button>
                </form>

                {status === 'failed' && <p style={styles.errorText}>Hata: {error}</p>}

                <p style={styles.footerText}>
                    Zaten hesabın var mı? <Link to="/login" style={styles.link}>Giriş Yap</Link>
                </p>
            </div>
        </div>
    );
};

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

export default Register;