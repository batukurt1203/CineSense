using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CineSense.Backend.Data; // Kendi DbContext yolunu kontrol et
using System.Net.Http;
using System.Net.Http.Json;
using System.Linq;
using System.Threading.Tasks;
using CineSense.Backend.Models;
using CineSense.Backend.Models.DTOs;

namespace CineSense.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // GÜVENLİK KİLİDİ: Sadece JWT biletinde "Admin" mührü olanlar bu sınıfa girebilir
    [Authorize(Roles = "Admin")] 
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetSystemStats()
        {
            // Veritabanından canlı olarak toplam kullanıcı ve film sayısını çekiyoruz
            var totalUsers = await _context.Users.CountAsync();
            var totalMovies = await _context.Movies.CountAsync();

            return Ok(new
            {
                TotalUsers = totalUsers,
                TotalMovies = totalMovies,
                AiStatus = "Aktif" // Yapay zeka motoru çalıştığı sürece bu şimdilik sabit kalabilir
            });
        }
        [HttpPost("seed-movies")]
        public async Task<IActionResult> SeedPopularMovies([FromQuery] int pages = 25)
        {
            string tmdbApiKey = "7412167ebc9ae2b29fbad93167a347c6"; 
            using var httpClient = new HttpClient();
            int addedCount = 0;
            
            // YENİ: Rastgele sayfa üretici
            Random rnd = new Random();

            for (int i = 1; i <= pages; i++)
            {
                // YENİ: 1 ile 500 arasında rastgele bir sayfa seç (TMDB Popüler listesi 500 sayfadır)
                int randomPage = rnd.Next(1, 501);

                // İsteği 'i' ile değil 'randomPage' ile yapıyoruz
                var listResponse = await httpClient.GetAsync($"https://api.themoviedb.org/3/movie/popular?api_key={tmdbApiKey}&language=tr-TR&page={randomPage}");
                
                if (!listResponse.IsSuccessStatusCode) continue;

                var listData = await listResponse.Content.ReadFromJsonAsync<TmdbPopularResponse>();
                if (listData == null || listData.Results == null) continue;

                foreach (var basicMovie in listData.Results)
                {
                    if (_context.Movies.Any(m => m.Id == basicMovie.Id)) continue;

                    var detailResponse = await httpClient.GetAsync($"https://api.themoviedb.org/3/movie/{basicMovie.Id}?api_key={tmdbApiKey}&language=tr-TR");
                    
                    if (detailResponse.IsSuccessStatusCode)
                    {
                        var tmdbData = await detailResponse.Content.ReadFromJsonAsync<TmdbMovieDto>();
                        if (tmdbData != null)
                        {
                            var newMovie = new Movie 
                            {
                                Id = tmdbData.Id,
                                Title = tmdbData.Title ?? "Bilinmeyen Film",
                                Overview = string.IsNullOrWhiteSpace(tmdbData.Overview) ? "Bu film için Türkçe özet bulunmamaktadır." : tmdbData.Overview,
                                Genres = tmdbData.Genres != null && tmdbData.Genres.Any() ? string.Join(", ", tmdbData.Genres.Select(g => g.Name)) : "Bilinmiyor",
                                ReleaseDate = string.IsNullOrWhiteSpace(tmdbData.ReleaseDate) ? "Bilinmiyor" : tmdbData.ReleaseDate,
                                VoteAverage = tmdbData.VoteAverage
                            };

                            _context.Movies.Add(newMovie);
                            addedCount++;
                        }
                    }
                }
                await _context.SaveChangesAsync();
            }

            return Ok(new { Message = $"{addedCount} yeni film başarıyla veritabanına eklendi!" });
        }    }

    // TMDB'nin popüler film listesi cevabını okumak için küçük bir DTO
    public class TmdbPopularResponse
    {
        public List<TmdbBasicMovieDto> Results { get; set; }
    }

    public class TmdbBasicMovieDto
    {
        public int Id { get; set; }
    }
}