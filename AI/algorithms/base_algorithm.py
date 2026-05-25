from abc import ABC, abstractmethod
from typing import List

class BaseRecommendationStrategy(ABC):
    """
    Tüm öneri algoritmaları için standart bir şablon (Strategy Pattern) belirler.
    İleride eklenecek yeni algoritmalar bu sınıftan miras almalıdır.
    """
    @abstractmethod
    def recommend(self, favorite_movies: List[dict], candidates: List[dict], mood: str) -> dict:
        pass