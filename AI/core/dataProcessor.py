from abc import ABC, abstractmethod
from typing import List, Dict, Any

class DataProcessorTemplate(ABC):
    """
    Veri ön işleme adımlarını standartlaştıran Template Method deseni sınıfı.
    İşlem sırasını sabit tutar, alt sınıflar adımların içeriğini belirler.
    """
    def process_data(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # Template method: İşlem sırası kesin ve değiştirilemez
        cleaned_data = self._clean_data(raw_data)
        featured_data = self._extract_features(cleaned_data)
        normalized_data = self._normalize(featured_data)
        return normalized_data

    @abstractmethod
    def _clean_data(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def _extract_features(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        pass

    def _normalize(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # Varsayılan davranış (İstenirse alt sınıflarda ezilebilir)
        return data


class MovieDataProcessor(DataProcessorTemplate):
    """Film verilerine özel işlem yapan somut (concrete) sınıf."""

    def _clean_data(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        cleaned = []
        for item in data:
            # Oyuncu ve yönetmen isimlerindeki boşlukları siliyoruz ki
            # "Tom Hardy" ve "Tom Cruise" için "Tom" kelimesi ortak özellik sayılmasın.
            # "tomhardy" ve "tomcruise" olarak ayrı token'lar oluşturuyoruz.
            cleaned_item = {
                "movie_id": item.get("movie_id"),
                "title": str(item.get("title", "")).strip(),
                "genres": [g.lower().replace(" ", "") for g in item.get("genres", [])],
                "cast": [c.lower().replace(" ", "") for c in item.get("cast", [])],
                "director": str(item.get("director", "unknown")).lower().replace(" ", ""),
                "overview": str(item.get("overview", "")).lower()
            }
            cleaned.append(cleaned_item)
        return cleaned

    def _extract_features(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # Tüm özellikleri tek bir metin bloğu (metin çorbası - soup) haline getiriyoruz.
        # Bu, metin vektörleştirme işlemi için gereklidir.
        for item in data:
            combined_features = " ".join(item["genres"]) + " " + \
                                " ".join(item["cast"]) + " " + \
                                item["director"] + " " + \
                                item["overview"]
            item["combined_features"] = combined_features
        return data