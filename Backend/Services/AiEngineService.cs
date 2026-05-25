using System.Text.Json; // Bunu en tepeye eklemeyi unutma
using CineSense.Backend.Data;
using CineSense.Backend.Models.DTOs;
using CineSense.Backend.Services;
using Microsoft.EntityFrameworkCore;
// ... (diğer usingler)

public class AiEngineService : IAiEngineService
{
    private readonly HttpClient _httpClient;
    private readonly ApplicationDbContext _context;

    public AiEngineService(HttpClient httpClient, ApplicationDbContext context)
    {
        _httpClient = httpClient;
        _context = context;
    }

    public async Task<AiEngineResponse> GetRecommendationAsync(List<int> userFavoriteIds, UserProfileDto profile)
    {
        var allMovies = await _context.Movies.ToListAsync();

        var favorites = allMovies.Where(m => userFavoriteIds.Contains(m.Id))
            .Select(m => new MovieDataDto { Id = m.Id, Title = m.Title, Overview = m.Overview, Genres = m.Genres }).ToList();
            
        var candidates = allMovies.Where(m => !userFavoriteIds.Contains(m.Id))
            .Select(m => new MovieDataDto { Id = m.Id, Title = m.Title, Overview = m.Overview, Genres = m.Genres }).ToList();

        var requestPayload = new AiEngineRequest
        {
            FavoriteMovies = favorites,
            CandidateMovies = candidates,
            UserProfile = profile
        };

        var response = await _httpClient.PostAsJsonAsync("http://127.0.0.1:8000/recommend", requestPayload);
        
        response.EnsureSuccessStatusCode();
        
        // --- DEĞİŞTİRİLEN KISIM BURADAN BAŞLIYOR ---
        
        // 1. Python'dan gelen ham metni (JSON) doğrudan okuyup C# terminaline yazdırıyoruz
        var rawJson = await response.Content.ReadAsStringAsync();
        
        Console.WriteLine("\n=========================================");
        Console.WriteLine($"PYTHON'DAN C#'A GELEN HAM JSON: {rawJson}");
        Console.WriteLine("=========================================\n");

        // 2. Büyük/küçük harf duyarlılığını tamamen kapatarak JSON'ı çözümlüyoruz
        var options = new JsonSerializerOptions 
        { 
            PropertyNameCaseInsensitive = true 
        };
        
        var aiResponse = JsonSerializer.Deserialize<AiEngineResponse>(rawJson, options);
        
        return aiResponse;
    }
}