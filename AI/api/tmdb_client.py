import os
import requests
from dotenv import load_dotenv
from typing import List, Dict

# .env dosyasındaki değişkenleri sisteme yüklüyoruz
load_dotenv()

class TMDBClient:
    def __init__(self):
        self.api_key = os.getenv("TMDB_API_KEY")
        self.base_url = "https://api.themoviedb.org/3"
        # Önbellekleme (Caching) için basit bir sözlük kullanıyoruz
        # Format: { movie_id: { 'title': '...', 'overview': '...', 'genres': [...] } }
        self._cache: Dict[int, dict] = {}

    def get_movie_details(self, movie_id: int) -> dict:
        """
        Verilen ID'ye göre film detaylarını getirir. 
        Eğer film daha önce çekildiyse doğrudan önbellekten (cache) döndürür.
        """
        if not self.api_key:
            raise ValueError("TMDB_API_KEY bulunamadı! Lütfen .env dosyasını kontrol edin.")

        # 1. Kontrol: Veri zaten hafızada (cache) var mı?
        if movie_id in self._cache:
            print(f"[CACHE] {movie_id} numaralı film hafızadan getirildi.")
            return self._cache[movie_id]

        # 2. İnternete Çıkış: Veri hafızada yoksa TMDB'ye istek at
        print(f"[API] {movie_id} numaralı film TMDB'den çekiliyor...")
        url = f"{self.base_url}/movie/{movie_id}"
        params = {
            "api_key": self.api_key,
            "language": "tr-TR" # Verileri Türkçe almak için
        }

        try:
            response = requests.get(url, params=params)
            response.raise_for_status() # Hata varsa (örn. 404) fırlat

            data = response.json()

            # Vektörizasyon için bize lazım olan asıl bilgileri filtreleyip alıyoruz
            movie_data = {
                "id": data.get("id"),
                "title": data.get("title"),
                "overview": data.get("overview", ""), # Filmin özeti (İçerik analizi için çok önemli)
                "genres": [genre["name"] for genre in data.get("genres", [])] # ["Aksiyon", "Bilim Kurgu"]
            }

            # 3. Kayıt: Çekilen veriyi bir sonraki sefer için hafızaya kaydet
            self._cache[movie_id] = movie_data
            return movie_data

        except requests.exceptions.RequestException as e:
            print(f"TMDB API Hatası ({movie_id}): {e}")
            return None

    def get_multiple_movies(self, movie_ids: List[int]) -> List[dict]:
        """Birden fazla filmin detayını topluca getirir."""
        movies = []
        for mid in movie_ids:
            movie = self.get_movie_details(mid)
            if movie:
                movies.append(movie)
        return movies