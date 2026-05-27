using System.Collections.Generic;

namespace CineSense.Backend.Models.DTOs
{
    public class AiMovieData
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Overview { get; set; }
        public string Genres { get; set; } // Virgülle ayrılmış metin (Örn: "Aksiyon, Suç")
    }

    public class AiUserProfile
    {
        public string CurrentMood { get; set; }
        public int AvailableTimeMinutes { get; set; }
        public string SocialContext { get; set; }
    }

    public class AiRecommendationRequest
    {
        public List<AiMovieData> FavoriteMovies { get; set; }
        public List<AiMovieData> CandidateMovies { get; set; }
        public AiUserProfile UserProfile { get; set; }
    }

    public class AiRecommendationResponse
    {
        public int RecommendedMovieId { get; set; }
        public string RecommendedMovieTitle { get; set; }
        public string Message { get; set; }
    }
}