using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using CineSense.Backend.Data;
using CineSense.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace CineSense.Backend.Services
{
    public class TmdbSeederService
    {
        private readonly ApplicationDbContext _context;
        private readonly HttpClient _httpClient;
        
        // Buraya kendi TMDB API Anahtarını yazmalısın
        private readonly string _apiKey = "7412167ebc9ae2b29fbad93167a347c6"; 
        private readonly string _baseUrl = "https://api.themoviedb.org/3";

        // TMDB Tür ID'lerini metinlere çevirecek sözlüğümüz
        private readonly Dictionary<string, string> _genreMapping = new Dictionary<string, string>
        {
            { "28", "Aksiyon" }, { "12", "Macera" }, { "16", "Animasyon" }, { "35", "Komedi" },
            { "80", "Suç" }, { "99", "Belgesel" }, { "18", "Dram" }, { "10751", "Aile" },
            { "14", "Fantastik" }, { "36", "Tarih" }, { "27", "Korku" }, { "10402", "Müzik" },
            { "9648", "Gizem" }, { "10749", "Romantik" }, { "878", "Bilim Kurgu" },
            { "10770", "TV Filmi" }, { "53", "Gerilim" }, { "10752", "Savaş" }, { "37", "Vahşi Batı" }
        };

        public TmdbSeederService(ApplicationDbContext context, HttpClient httpClient)
        {
            _context = context;
            _httpClient = httpClient;
        }

        public async Task SeedMoviesAsync()
        {
            Console.WriteLine("[SEEDER] TMDB'den yeni popüler filmler kontrol ediliyor...");

            var moviesToAdd = new List<Movie>();
            
            // Daha fazla aday film için 3 sayfa çekiyoruz (Yaklaşık 60 film)
            for (int page = 1; page <= 3; page++)
            {
                var requestUrl = $"{_baseUrl}/movie/popular?api_key={_apiKey}&language=tr-TR&page={page}";
                var response = await _httpClient.GetAsync(requestUrl);

                if (response.IsSuccessStatusCode)
                {
                    var jsonString = await response.Content.ReadAsStringAsync();
                    var jsonResponse = JObject.Parse(jsonString);
                    var results = jsonResponse["results"] as JArray;

                    if (results != null)
                    {
                        foreach (var item in results)
                        {
                            try
                            {
                                int movieId = item["id"].Value<int>();

                                // Veritabanında bu ID'ye sahip film zaten var mı diye kontrol et
                                bool existsInDb = await _context.Movies.AnyAsync(m => m.Id == movieId);

                                // Eğer şu anki ekleme listemizde veya veritabanında zaten varsa, bu filmi atla
                                if (moviesToAdd.Any(m => m.Id == movieId) || existsInDb) 
                                {
                                    continue;
                                }

                                // Tür numaralarını (ID) isimlere çeviriyoruz
                                var genreIds = item["genre_ids"]?.Select(g => g.ToString()) ?? new List<string>();
                                var genreNames = genreIds.Select(id => _genreMapping.ContainsKey(id) ? _genreMapping[id] : id).ToList();
                                string genres = string.Join(", ", genreNames);

                                var movie = new Movie
                                {
                                    Id = movieId,
                                    Title = item["title"]?.ToString() ?? "Bilinmeyen Film",
                                    Overview = item["overview"]?.ToString() ?? "",
                                    Genres = genres 
                                };

                                moviesToAdd.Add(movie);
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"[SEEDER Hata] Bir film eklenirken hata oluştu: {ex.Message}");
                            }
                        }
                    }
                }
            }

            // Sadece veritabanında olmayan YENİ filmleri kaydet
            if (moviesToAdd.Count > 0)
            {
                await _context.Movies.AddRangeAsync(moviesToAdd);
                await _context.SaveChangesAsync();
                Console.WriteLine($"[SEEDER] Başarılı! Toplam {moviesToAdd.Count} adet YENİ film veritabanına eklendi.");
            }
            else
            {
                Console.WriteLine("[SEEDER] Veritabanı güncel. Eklenecek yeni popüler film bulunamadı.");
            }
        }
    }
}