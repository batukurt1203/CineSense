from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from typing import List, Dict, Any, Tuple
import numpy as np

class MovieVectorizer:
    """
    Film özelliklerini (metin çorbasını) makine öğrenimi modellerinin
    kullanabileceği sayısal matrislere dönüştürür.
    """
    def __init__(self, use_tfidf: bool = False):
        # TF-IDF (Term Frequency-Inverse Document Frequency) nadir geçen özel kelimelere
        # daha yüksek ağırlık verir. CountVectorizer ise sadece kelime frekansını sayar.
        # Duruma göre ikisinden biri seçilebilir.
        if use_tfidf:
            self.vectorizer = TfidfVectorizer(stop_words='english')
        else:
            self.vectorizer = CountVectorizer(stop_words='english')

    def fit_transform(self, data: List[Dict[str, Any]]) -> Tuple[Any, List[int]]:
        """
        Veriyi alır, vektörleştiriciyi eğitir ve vektör matrisini döndürür.
        
        Dönüş Değeri:
        - feature_matrix: Kelimelerin sayısal temsili (Scipy Sparse Matrix türünde)
        - movie_ids: Matristeki satırların hangi filme ait olduğunu tutan ID listesi
        """
        # Sadece birleştirilmiş metinleri ("combined_features") bir listeye çekiyoruz
        corpus = [item.get("combined_features", "") for item in data]
        movie_ids = [item.get("movie_id") for item in data]

        # Vektör matrisini oluştur
        feature_matrix = self.vectorizer.fit_transform(corpus)

        return feature_matrix, movie_ids

    def transform(self, data: List[Dict[str, Any]]) -> Any:
        """
        Daha önceden eğitilmiş (fit edilmiş) kelime dağarcığını kullanarak
        yeni gelen veriyi vektör matrisine dönüştürür.
        """
        corpus = [item.get("combined_features", "") for item in data]
        return self.vectorizer.transform(corpus)