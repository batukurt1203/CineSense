using System;

namespace CineSense.Backend.Models
{
    public class Rating
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int MovieId { get; set; }
        public int Score { get; set; } // 1 ile 5 (veya 10) arası puan
        public DateTime RatedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; }
        public Movie Movie { get; set; }
    }
}