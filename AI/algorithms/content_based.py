from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List
from algorithms.base_algorithm import BaseRecommendationStrategy

class ContentBasedFiltering(BaseRecommendationStrategy):
    def recommend(self, favorite_movies: List[dict], candidates: List[dict], mood: str) -> dict:
        # Soğuk Başlangıç (Cold Start) kontrolü
        if not favorite_movies or not candidates:
            return {"recommendedMovieId": 0, "message": "Yeterli film verisi bulunamadı."}

        # 1. Kullanıcı Profilini Hazırla (Türler, Özetler ve Ruh Hali)
        # Sevilen filmlerin metinlerini birleştiriyoruz
        user_profile_text = " ".join([f"{m.get('overview', '')} {' '.join(m.get('genres', []))}" for m in favorite_movies])

        # Seçilen ruh halinin ağırlığını artırmak için metne birkaç kez ekliyoruz
        user_profile_text += f" {mood} " * 3

        # 2. Aday Filmlerin Verilerini Hazırla
        candidate_ids = [c['id'] for c in candidates]
        candidate_texts = [f"{c.get('overview', '')} {' '.join(c.get('genres', []))}" for c in candidates]

        # 3. TF-IDF Vektörizasyon İşlemi
        # Kullanıcı profili her zaman 0. indekste olacak şekilde listeyi birleştiriyoruz
        all_texts = [user_profile_text] + candidate_texts

        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(all_texts)

        # 4. Kosinüs Benzerliği (Cosine Similarity) Hesaplama
        # Formül: cos(θ) = A·B / ||A|| ||B||
        user_vector = tfidf_matrix[0:1]
        candidate_vectors = tfidf_matrix[1:]

        similarity_scores = cosine_similarity(user_vector, candidate_vectors).flatten()

        # 5. En Yüksek Skoru Alan İlk 3 Filmi Bul
        top_indices = similarity_scores.argsort()[-3:][::-1]

        recommended_movies = []
        for idx in top_indices:
            movie = candidates[idx]
            recommended_movies.append({
                "recommendedMovieId": movie.get('id'),
                "recommendedMovieTitle": movie.get('title', 'Bilinmeyen Film'),
                "matchScore": round(float(similarity_scores[idx] * 100), 2)
            })

        return {
            "recommendations": recommended_movies,
            "message": "Algoritma başarıyla çalıştı."
        }

        # En iyi eşleşen filmin tüm verisine ulaşıyoruz
        best_movie = candidates[best_match_index]
        best_movie_id = best_movie.get('id')
        best_movie_title = best_movie.get('title', 'Bilinmeyen Film') # İsmi buradan cımbızlıyoruz

        return {
            "recommendedMovieId": best_movie_id,
            "recommendedMovieTitle": best_movie_title, 
            "message": f"Algoritma çalıştı. '{best_movie_title}' filmi önerildi."
        }