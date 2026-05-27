import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List
from algorithms.base_algorithm import BaseRecommendationStrategy

class ContentBasedFiltering(BaseRecommendationStrategy):
    def recommend(self, favorite_movies: List[dict], candidates: List[dict], mood: str) -> dict:
        # Soğuk Başlangıç (Cold Start) kontrolü
        if not favorite_movies or not candidates:
            return {"recommendedMovieId": 0, "message": "Yeterli film verisi bulunamadı."}

        # 1. Kullanıcı Profilini Hazırla
        user_profile_text = " ".join([f"{m.get('overview', '')} {' '.join(m.get('genres', []))}" for m in favorite_movies])
        user_profile_text += f" {mood} " * 3

        # 2. Aday Filmlerin Verilerini Hazırla
        candidate_ids = [c['id'] for c in candidates]
        candidate_texts = [f"{c.get('overview', '')} {' '.join(c.get('genres', []))}" for c in candidates]

        # 3. TF-IDF Vektörizasyon İşlemi
        all_texts = [user_profile_text] + candidate_texts
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(all_texts)

        # 4. Kosinüs Benzerliği Hesaplama ve Beraberlik Bozucu (Jitter)
        user_vector = tfidf_matrix[0:1]
        candidate_vectors = tfidf_matrix[1:]

        similarity_scores = cosine_similarity(user_vector, candidate_vectors).flatten()

        # Skorlar eşitse hep aynı filmler çıkmasın diye çok ufak bir rastgelelik ekliyoruz
        noise = np.random.uniform(-0.0001, 0.0001, size=similarity_scores.shape)
        similarity_scores = similarity_scores + noise

        # [TEŞHİS RÖNTGENİ] Arka planda dönen puanları Python terminaline yazdırıyoruz
        print("\n--- YAPAY ZEKA SKOR TABLOSU (İLK 10) ---")
        top_10_indices = similarity_scores.argsort()[-10:][::-1]
        for idx in top_10_indices:
            print(f"Skor: %{similarity_scores[idx]*100:.2f} | Film: {candidates[idx].get('title')}")
        print("----------------------------------------\n")

        # 5. En Yüksek Skoru Alan İLK 3 Filmi Bul (Çoklu Film Formatı)
        top_3_indices = similarity_scores.argsort()[-3:][::-1]

        recommended_movie_ids = []
        recommended_movie_titles = []

        for idx in top_3_indices:
            movie = candidates[idx]
            recommended_movie_ids.append(int(movie.get('id')))
            recommended_movie_titles.append(movie.get('title', 'Bilinmeyen Film'))

        names_str = ", ".join(recommended_movie_titles)

        return {
            "recommendedMovieIds": recommended_movie_ids, # DİKKAT: İsim çoğul oldu ve liste dönüyoruz
            "message": f"Algoritma çalıştı. Önerilenler: {names_str}"
        }