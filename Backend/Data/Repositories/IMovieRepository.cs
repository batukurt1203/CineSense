using CineSense.Backend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CineSense.Backend.Data.Repositories
{
    public interface IMovieRepository
    {
        /// Verilen ID listesine göre filmlerin detaylarını veritabanından getirir.
        Task<List<Movie>> GetMoviesByIdsAsync(List<int> movieIds);

        /// Veritabanına yeni filmler ekler (Cache/Önbellekleme mantığı için).
        Task AddMoviesAsync(List<Movie> movies);

        /// Yapay zeka motoru cevap veremezse (Cold Start) gösterilecek popüler filmleri getirir.
        Task<List<Movie>> GetPopularMoviesAsync(int count = 5);
        
        Task AddAsync(Movie movie);
    }
}