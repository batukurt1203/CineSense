using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CineSense.Backend.Models.DTOs;
using CineSense.Backend.Services;
using CineSense.Backend.Data.Repositories;
 using CineSense.Backend.Models; // Movie veritabanı modelinin bulunduğu namespace'i aktif etmeyi unutma

namespace CineSense.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecommendationController : ControllerBase
    {
        private readonly CacheEngine _cacheEngine;
        private readonly IAiEngineService _aiEngineService;
        private readonly IMovieRepository _movieRepository;

        public RecommendationController(
            CacheEngine cacheEngine,
            IAiEngineService aiEngineService,
            IMovieRepository movieRepository)
        {
            _cacheEngine = cacheEngine;
            _aiEngineService = aiEngineService;
            _movieRepository = movieRepository;
        }

        [HttpPost("recommend")]
        public async Task<IActionResult> GetRecommendations([FromBody] RecommendationRequestDto request)
        {
            try
            {
                if (request == null || request.FavoriteMovieIds == null || request.FavoriteMovieIds.Count == 0)
                {
                    return BadRequest("Lütfen en az bir favori film seçin.");
                }

                // 1. Önbellekten veya veritabanından mevcut filmleri kontrol et
                var moviesMetadata = await _cacheEngine.GetOrCreateMoviesAsync(request.FavoriteMovieIds);
                var existingIds = moviesMetadata?.Select(m => m.Id).ToList() ?? new List<int>();

                // 2. Veritabanında eksik olan (bulunamayan) film ID'lerini tespit et
                var missingIds = request.FavoriteMovieIds.Except(existingIds).ToList();

                // 3. Eksik filmler varsa, TMDB'den otomatik indir ve veritabanına kaydet
// 3. Eksik filmler varsa, TMDB'den otomatik indir ve veritabanına kaydet
                if (missingIds.Any())
                {
                    using var httpClient = new HttpClient();
                    // DİKKAT: Kendi gerçek TMDB anahtarını buraya kesinlikle yapıştırmalısın!
                    string tmdbApiKey = "7412167ebc9ae2b29fbad93167a347c6"; 

                    foreach (var id in missingIds)
                    {
                        var response = await httpClient.GetAsync($"https://api.themoviedb.org/3/movie/{id}?api_key={tmdbApiKey}&language=tr-TR");
        
                        if (response.IsSuccessStatusCode)
                        {
                            var tmdbData = await response.Content.ReadFromJsonAsync<TmdbMovieDto>();
            
                            if (tmdbData != null)
                            {
                                var newMovie = new Movie 
                                {
                                    Id = tmdbData.Id,
                                    Title = tmdbData.Title ?? "Bilinmeyen Film",
                                    // ÇÖZÜM: TMDB'den özet boş gelirse DB çökmesin diye varsayılan bir metin atıyoruz
                                    Overview = string.IsNullOrWhiteSpace(tmdbData.Overview) 
                                        ? "Bu film için Türkçe özet bulunmamaktadır." 
                                        : tmdbData.Overview,
                                    // ÇÖZÜM: Türler boş gelirse hata vermesini engelliyoruz
                                    Genres = tmdbData.Genres != null && tmdbData.Genres.Any() 
                                        ? string.Join(", ", tmdbData.Genres.Select(g => g.Name)) 
                                        : "Bilinmiyor"
                                };

                                await _movieRepository.AddAsync(newMovie); 
                                Console.WriteLine($"\n[BAŞARILI] '{newMovie.Title}' TMDB'den indirildi ve veritabanına kaydedildi!");
                            }
                        }
                        else
                        {
                            // Eğer API Anahtarı yanlışsa veya TMDB yanıt vermiyorsa bunu C# terminalinde göreceğiz
                            Console.WriteLine($"\n[HATA] TMDB'den film indirilemedi! ID: {id}, Hata Kodu: {response.StatusCode}");
                        }
                    }
                }
                // 4. Yapay zeka motoruna verileri ve kullanıcı profilini iletiyoruz
                // Yapay zeka motoruna verileri ve kullanıcı profilini iletiyoruz
                var aiResponse = await _aiEngineService.GetRecommendationAsync(request.FavoriteMovieIds, request.UserProfile);

// ARTIK LİSTE DEĞİL, TEKİL ID KONTROLÜ YAPILIYOR
                if (aiResponse == null || aiResponse.RecommendedMovieId == 0)
                {
                    return Ok(await _movieRepository.GetPopularMoviesAsync());
                }

// Repository bir liste beklediği için tekil ID'yi bir listenin içine sarmallayarak gönderiyoruz
                var recommendedMovies = await _movieRepository.GetMoviesByIdsAsync(new List<int> { aiResponse.RecommendedMovieId });
                return Ok(recommendedMovies);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"Sunucu hatası: {ex.Message}");
            }
        }

        [HttpGet("ping")]
        public IActionResult Ping()
        {
            return Ok("C# ve React başarıyla konuşuyor!");
        }
    }
}

// TMDB'den dönen JSON verisini karşılamak için gerekli DTO'lar
namespace CineSense.Backend.Models.DTOs
{
 
}