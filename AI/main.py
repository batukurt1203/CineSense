from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from algorithms.content_based import ContentBasedFiltering

app = FastAPI(title="CineSense AI Motoru")

# C#'tan gelecek filmlerin şablonu
class MovieData(BaseModel):
    id: int
    title: str
    overview: str
    genres: str # C#'tan virgüllü metin olarak gelecek (Örn: "Aksiyon, Suç")

class UserProfile(BaseModel):
    currentMood: str
    availableTimeMinutes: int
    socialContext: str

class RecommendationRequest(BaseModel):
    favoriteMovies: List[MovieData]
    candidateMovies: List[MovieData]
    userProfile: UserProfile

@app.get("/")
def home():
    return {"message": "CineSense AI Motoru Başarıyla Çalışıyor!"}

@app.post("/recommend")
def get_recommendation(data: RecommendationRequest):
    print("\n" + "="*40)
    print(f"YENİ İSTEK: {len(data.favoriteMovies)} Favori, {len(data.candidateMovies)} Aday Film C#'tan alındı.")

    # ÇÖZÜM 2: Recommender nesnesini burada kurarak, C#'ın veritabanına yeni eklediği filmleri anlık tanımasını sağlıyoruz.
    recommender = ContentBasedFiltering()

    # Pydantic modellerini sözlük yapısına dönüştürme
    def convert_to_dict(movie_list: List[MovieData]):
        return [
            {
                "id": m.id,
                "title": m.title,
                "overview": m.overview,
                "genres": [g.strip() for g in m.genres.split(",")]
            }
            for m in movie_list
        ]

    favorites_dict = convert_to_dict(data.favoriteMovies)
    candidates_dict = convert_to_dict(data.candidateMovies)

    # ÇÖZÜM 1: Ruh haline göre dinamik tür eşleştirmesi ve ön filtreleme
    mood_genre_mapping = {
        "Heyecanlı": ["Aksiyon", "Macera", "Gerilim", "Bilim Kurgu", "Korku"],
        "Düşünceli": ["Dram", "Gizem", "Suç", "Tarih", "Belgesel", "Biyografi"],
        "Eğlenceli": ["Komedi", "Animasyon", "Aile", "Fantezi", "Romantik"]
    }

    target_genres = mood_genre_mapping.get(data.userProfile.currentMood, [])

    # Aday filmleri kullanıcının seçtiği ruh haline uygun olan türlere göre filtrele
    mood_candidates = [
        m for m in candidates_dict
        if any(genre in target_genres for genre in m["genres"])
    ]

    # Eğer o ruh haline uygun hiçbir aday film yoksa filtreyi esnetip tüm adayları gönder
    final_candidates = mood_candidates if mood_candidates else candidates_dict

    print(f"Yapay Zeka çalışuyor... (Ruh Hali: {data.userProfile.currentMood} | Filtrelenmiş Aday Sayısı: {len(final_candidates)})")

    # Gerçek Yapay Zeka Algoritmasını Çalıştır
    result = recommender.recommend(
        favorite_movies=favorites_dict,
        candidates=final_candidates,
        mood=data.userProfile.currentMood
    )

    print(f"[SONUÇ] {result.get('message')}")
    print("="*40)

    return result