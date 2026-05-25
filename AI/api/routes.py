from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter()

# --- Pydantic Modelleri (Veri Doğrulama Şemaları) ---

class MovieFeature(BaseModel):
    """.NET Backend'den gelecek olan tek bir filmin meta veri yapısı."""
    movie_id: int
    title: str
    genres: List[str]
    cast: List[str]
    director: str
    overview: str

class AnalysisRequest(BaseModel):
    """/analyze endpoint'ine yapılacak POST isteğinin gövde (body) yapısı."""
    favorite_movies: List[MovieFeature]
    mood_profile: Dict[str, Any] = None  # Tasarım belgesindeki "Mood Profile" için opsiyonel alan

class RecommendationResponse(BaseModel):
    """.NET Backend'e döndürülecek olan analiz sonucu yapısı."""
    recommended_movie_ids: List[int]
    scores: List[float]

# --- Uç Noktalar (Endpoints) ---

@router.post("/analyze", response_model=RecommendationResponse)
async def analyze_preferences(request: AnalysisRequest):
    """
    Kullanıcının seçtiği favori filmlerin meta verilerini alır,
    yapay zeka algoritmalarına iletir ve benzer film ID'lerini döndürür.
    """
    try:
        # 1. Gelen verinin temel kontrolü
        if not request.favorite_movies:
            raise HTTPException(status_code=400, detail="En az bir favori film gereklidir.")

        # 2. Gelecekte eklenecek Yapay Zeka Mantığı (Şablon Yorumları)
        # TODO: data_processor.py çağrılacak (Veri temizleme ve hazırlama)
        # TODO: vectorizer.py çağrılacak (Türleri, yönetmenleri matematiksel vektörlere çevirme)
        # TODO: IRecommendationStrategy.py çalıştırılacak (Örn: Cosine Similarity ile veri setinden eşleşme bulma)

        # 3. Geliştirme aşaması için sahte (Mock) Yanıt
        # AI algoritmaları yazılana kadar sistemin çökmemesi ve Backend/Frontend 
        # ekiplerinin test yapabilmesi için sahte bir veri döndürüyoruz.
        mock_recommendations = [550, 27205, 155, 680, 157336] # Örnek TMDB ID'leri (Dövüş Kulübü, Başlangıç vb.)
        mock_scores = [0.98, 0.92, 0.89, 0.85, 0.77]

        return RecommendationResponse(
            recommended_movie_ids=mock_recommendations,
            scores=mock_scores
        )

    except Exception as e:
        # Beklenmeyen hataları yakala ve 500 Internal Server Error dön
        raise HTTPException(status_code=500, detail=str(e))