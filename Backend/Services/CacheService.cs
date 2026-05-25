using CineSense.Backend.Data.Repositories;
using CineSense.Backend.Models;

namespace CineSense.Backend.Services
{
    /// <summary>
    /// Harici sinema API isteklerini optimize etmek ve hız sınırlarına (Rate Limiting) takılmamak için
    /// veritabanını akıllı bir önbellek olarak yöneten motor sınıfı.
    /// </summary>
    public class CacheEngine
    {
        private readonly IMovieRepository _movieRepository;
        private readonly IExternalApiService _externalApiService;

        public CacheEngine(IMovieRepository movieRepository, IExternalApiService externalApiService)
        {
            _movieRepository = movieRepository;
            _externalApiService = externalApiService;
        }

        /// <summary>
        /// İstenen film ID'lerini alır, önce yerel veritabanında arar. 
        /// Eksik olanları harici API'den çekip veritabanına kaydeder ve birleştirilmiş listeyi döner.
        /// </summary>
        public async Task<List<Movie>> GetOrCreateMoviesAsync(List<int> movieIds)
        {
            if (movieIds == null || !movieIds.Any())
                return new List<Movie>();

            // 1. Adım: İstetilen filmleri yerel PostgreSQL veritabanında sorgula
            var cachedMovies = await _movieRepository.GetMoviesByIdsAsync(movieIds);
            
            // Bulunan filmlerin ID'lerini listele
            var cachedMovieIds = cachedMovies.Select(m => m.Id).ToHashSet();

            // 2. Adım: Veritabanında *olmayan* (eksik) film ID'lerini tespit et
            var missingMovieIds = movieIds.Where(id => !cachedMovieIds.Contains(id)).ToList();

            // Eğer hiç eksik yoksa doğrudan önbellekteki filmleri geri dön (API'ye hiç bulaşma)
            if (!missingMovieIds.Any())
            {
                return cachedMovies;
            }

            // 3. Adım: Sadece eksik filmler için harici API'ye (TMDB) istek at
            var newlyFetchedMovies = new List<Movie>();
            foreach (var missingId in missingMovieIds)
            {
                try
                {
                    var movieMetadata = await _externalApiService.FetchMovieDetailsFromApiAsync(missingId);
                    if (movieMetadata != null)
                    {
                        newlyFetchedMovies.Add(movieMetadata);
                    }
                }
                catch (Exception ex)
                {
                    // Bir film çekilemezse bile uygulamanın çökmesini engelle, logla ve devam et
                    Console.WriteLine($"Film API'den çekilirken hata oluştu (ID: {missingId}): {ex.Message}");
                }
            }

            // 4. Adım: Harici API'den yeni çekilen filmleri gelecekte hızlıca okumak için veritabanına kaydet
            if (newlyFetchedMovies.Any())
            {
                await _movieRepository.AddMoviesAsync(newlyFetchedMovies);
                
                // Önbellekten gelenler ile yeni çekilenleri tek bir çatı altında birleştir
                cachedMovies.AddRange(newlyFetchedMovies);
            }

            // İstenen ID sıralamasına veya doğruluğuna göre listeyi nihai olarak dön
            return cachedMovies;
        }
    }
}