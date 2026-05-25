// src/api/appClient.js
import axios from 'axios';

// C# backend'imizin çalıştığı adres
const API_BASE_URL = 'http://localhost:5000/api';

const appClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Yapay zeka motorundan öneri almak için yazılmış fonksiyon
export const getRecommendation = async (favoriteMovieIds, userProfile) => {
    try {
        const payload = {
            favoriteMovieIds: favoriteMovieIds,
            userProfile: userProfile
        };

        // C# tarafındaki RecommendationController'a POST isteği atıyoruz
        const response = await appClient.post('/recommendation/recommend', payload);
        return response.data;
    } catch (error) {
        console.error("Yapay Zeka API'sine bağlanırken hata oluştu:", error);
        throw error;
    }
};

export default appClient;