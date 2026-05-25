using CineSense.Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CineSense.Backend.Data.Repositories
{
    public class MovieRepository : IMovieRepository
    {
        private readonly ApplicationDbContext _context;
        
        

        public MovieRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Movie>> GetMoviesByIdsAsync(List<int> movieIds)
        {
            // Veritabanında ID'si istenen listede olan filmleri getirir.
            // EF Core bunu arka planda "SELECT * FROM Movies WHERE Id IN (...)" sorgusuna çevirir.
            return await _context.Movies
                .Where(m => movieIds.Contains(m.Id))
                .ToListAsync();
        }

        public async Task AddMoviesAsync(List<Movie> movies)
        {
            // Yeni filmleri tabloya ekler. Eğer film zaten varsa hata fırlatmaması için
            // gerçek senaryoda Upsert (Var olanı güncelle, yoksa ekle) mantığı eklenebilir.
            var existingIds = await _context.Movies.Select(m => m.Id).ToListAsync();
            var newMovies = movies.Where(m => !existingIds.Contains(m.Id)).ToList();

            if (newMovies.Any())
            {
                await _context.Movies.AddRangeAsync(newMovies);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<Movie>> GetPopularMoviesAsync(int count = 5)
        {
            // Tasarım belgesindeki "Cold Start" kısıtlamasını aşmak için (DSD Bölüm 4)
            // Eğer sistem yeni kurulmuşsa ve AI öneri yapamıyorsa veritabanındaki 
            // rastgele veya varsayılan filmleri döndürür.
            return await _context.Movies
                .Take(count)
                .ToListAsync();
        }
        public async Task AddAsync(Movie movie)
        {
            // Gelen filmi veritabanı belleğine ekler
            await _context.Movies.AddAsync(movie);
            
            // Değişiklikleri SQL veritabanına kalıcı olarak kaydeder
            await _context.SaveChangesAsync();
        }
        
    }
}