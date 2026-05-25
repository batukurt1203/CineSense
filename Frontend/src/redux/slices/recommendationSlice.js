import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getRecommendation } from '../../api/appClient';

// --- Asenkron Thunk İşlemi ---
// (DSD Bölüm 3.2.141 - UI dispatch async action via Redux Thunk)
export const fetchRecommendations = createAsyncThunk(
    'recommendations/fetchRecommendations',
    async ({ favoriteMovieIds, moodProfile }, { rejectWithValue }) => {
        try {
            // apiClient.js dosyasında yazdığımız fonksiyonu çağırıyoruz
            const data = await getRecommendation(favoriteMovieIds, moodProfile);

            // Gelen veri şu formatta olmalı (Backend'den): 
            // [ { movie: { id: 1, title: "X", ... }, score: 0.98 }, ... ]
            // Geçici olarak mock veri dönüyorsak ona göre map'leme yapılabilir.
            return data;
        } catch (error) {
            // Hata durumunda action.payload içine hata mesajını yolluyoruz
            return rejectWithValue(error.message);
        }
    }
);

// --- Slice (Dilim) Tanımlaması ---
const recommendationSlice = createSlice({
    name: 'recommendations',
    initialState: {
        recommendations: [], // Backend'den gelen sonuçlar
        status: 'idle',      // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,         // Hata varsa mesajı burada tutulur
    },
    reducers: {
        // Senkron (normal) işlemler için. Örneğin:
        clearRecommendations: (state) => {
            state.recommendations = [];
            state.status = 'idle';
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Asenkron işlemin (Thunk) 3 farklı aşamasını (Promise states) yakalıyoruz
        builder
            .addCase(fetchRecommendations.pending, (state) => {
                // İstek başladı, butonu "Yükleniyor..." yapmak için state'i güncelliyoruz
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchRecommendations.fulfilled, (state, action) => {
                // İstek başarılı oldu, Backend'den filmler geldi
                state.status = 'succeeded';
                // Payload içindeki veriyi ana state'e yazıyoruz
                state.recommendations = action.payload;
            })
            .addCase(fetchRecommendations.rejected, (state, action) => {
                // İstek başarısız oldu (Ağ koptu, 500 hatası vb.)
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

// Senkron aksiyonları dışa aktar
export const { clearRecommendations } = recommendationSlice.actions;

// Reducer'ı dışa aktar (store.js içine koymak için)
export default recommendationSlice.reducer;