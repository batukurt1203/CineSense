using CineSense.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace CineSense.Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        public DbSet<Movie> Movies { get; set; }
        
        public DbSet<User> Users { get; set; }
        
        public DbSet<WatchlistItem> Watchlists { get; set; }
        public DbSet<Rating> Ratings { get; set; }
        public DbSet<ViewingHistory> ViewingHistories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Kullanıcı silinirse, ona ait liste ve puanların da silinmesini sağlıyoruz (Cascade Delete)
            modelBuilder.Entity<WatchlistItem>()
                .HasOne(w => w.User).WithMany().HasForeignKey(w => w.UserId).OnDelete(DeleteBehavior.Cascade);
        
            modelBuilder.Entity<Rating>()
                .HasOne(r => r.User).WithMany().HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Cascade);
        
            modelBuilder.Entity<ViewingHistory>()
                .HasOne(v => v.User).WithMany().HasForeignKey(v => v.UserId).OnDelete(DeleteBehavior.Cascade);
        }
        
    }
}