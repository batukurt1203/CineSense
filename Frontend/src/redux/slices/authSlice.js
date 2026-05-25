import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 1. Giriş Yapma (Login) İsteği
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || data || 'Giriş başarısız');

        // Başarılıysa Token'ı ve Kullanıcı Adını tarayıcıya kaydet
        localStorage.setItem('cinesense_token', data.token);
        localStorage.setItem('cinesense_username', data.username);
        localStorage.setItem('cinesense_role', data.role);
        return data;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// 2. Kayıt Olma (Register) İsteği
export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || data || 'Kayıt başarısız');
        return data;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

const authSlice = createSlice({
    name: 'auth',
    // Uygulama açıldığında tarayıcıda önceden kayıtlı bilet var mı diye kontrol ediyoruz
    initialState: {
        user: localStorage.getItem('cinesense_username') || null,
        token: localStorage.getItem('cinesense_token') || null,
        role: localStorage.getItem('cinesense_role') || 'User',
        status: 'idle',
        error: null
    },
    reducers: {
        // Çıkış Yapma (Logout) İşlemi
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem('cinesense_token');
            localStorage.removeItem('cinesense_username');
            localStorage.removeItem('cinesense_role');
        }
    },
    extraReducers: (builder) => {
        builder
            // Login Durumları
            .addCase(loginUser.pending, (state) => { state.status = 'loading'; state.error = null; })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.token = action.payload.token;
                state.user = action.payload.username;
                state.role = action.payload.role;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Register Durumları
            .addCase(registerUser.pending, (state) => { state.status = 'loading'; state.error = null; })
            .addCase(registerUser.fulfilled, (state) => { state.status = 'succeeded'; })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;