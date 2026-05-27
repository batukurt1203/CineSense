using System;

namespace CineSense.Backend.Models
{
    public class WatchlistItem
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int MovieId { get; set; }
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;

        // İlişkiler (Navigation Properties)
        public User User { get; set; }
        public Movie Movie { get; set; }
    }
}