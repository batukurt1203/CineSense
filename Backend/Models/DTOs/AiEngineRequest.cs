using System.Collections.Generic;

namespace CineSense.Backend.Models.DTOs
{
    // Kullanıcı Ruh Hali Şablonu
    public class UserProfileDto
    {
        public string CurrentMood { get; set; }
        public int AvailableTimeMinutes { get; set; }
        public string SocialContext { get; set; }
    }

    // Python'a Göndereceğimiz Yeni Film Şablonu
    public class MovieDataDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Overview { get; set; }
        public string Genres { get; set; }
    }

    // Ana Kargo Paketimiz
    public class AiEngineRequest
    {
        public List<MovieDataDto> FavoriteMovies { get; set; }
        public List<MovieDataDto> CandidateMovies { get; set; }
        public UserProfileDto UserProfile { get; set; }
    }
}