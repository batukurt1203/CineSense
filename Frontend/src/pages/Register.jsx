import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../redux/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'User' // YENİ: Başlangıç state'i olarak User
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData) // formData içinde artık role bilgisi de var
            });

            if (response.ok) {
                alert("Kayıt başarılı! Giriş yapabilirsiniz.");
                navigate('/login');
            } else {
                const errorData = await response.text();
                setError(`Kayıt başarısız: ${errorData}`);
            }
        } catch (err) {
            setError(`Bağlantı hatası: ${err.message}`);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Kayıt Ol</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="text" name="username" placeholder="Kullanıcı Adı"
                    value={formData.username} onChange={handleChange} required
                    style={{ padding: '10px' }}
                />

                <input
                    type="email" name="email" placeholder="E-Posta"
                    value={formData.email} onChange={handleChange} required
                    style={{ padding: '10px' }}
                />

                <input
                    type="password" name="password" placeholder="Şifre"
                    value={formData.password} onChange={handleChange} required
                    style={{ padding: '10px' }}
                />

                {/* YENİ: ROL SEÇİM ALANI */}
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    style={{ padding: '10px' }}
                >
                    <option value="User">Standart Kullanıcı (User)</option>
                    <option value="Admin">Sistem Yöneticisi (Admin)</option>
                </select>

                <button type="submit" style={{ padding: '10px', backgroundColor: '#007BFF', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    Kayıt Ol
                </button>
            </form>
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