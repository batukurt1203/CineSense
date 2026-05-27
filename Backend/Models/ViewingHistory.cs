using System;

namespace CineSense.Backend.Models
{
    public class ViewingHistory
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int MovieId { get; set; }
        public DateTime WatchedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; }
        public Movie Movie { get; set; }
    }
}