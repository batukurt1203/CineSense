import { configureStore } from '@reduxjs/toolkit';
import recommendationReducer from './slices/recommendationSlice';
import authReducer from './slices/authSlice'; 
export const store = configureStore({
    reducer: {
        // recommendationSlice içindeki tüm veriler (filmler, yüklenme durumu vb.)
        // 'recommendations' adı altında toplanır. 
        // Matchmaker sayfasındaki "state.recommendations" çağrısı buraya bakar.
        recommendations: recommendationReducer,
        auth: authReducer
        // İleride kullanıcı girişi (Auth) veya Watchlist (İzleme Listesi) gibi 
        // yeni özellikler eklendiğinde onların reducer'ları da buraya eklenecektir.
    },
});