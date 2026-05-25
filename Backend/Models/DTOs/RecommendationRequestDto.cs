using System.Collections.Generic;

namespace CineSense.Backend.Models.DTOs
{
    public class RecommendationRequestDto
    {
        // Frontend bize sadece ID'leri gönderecek
        public List<int> FavoriteMovieIds { get; set; }
        public UserProfileDto UserProfile { get; set; }
    }
}