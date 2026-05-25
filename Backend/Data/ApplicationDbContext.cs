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
        
    }
}