using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CineSense.Backend.Data;
using CineSense.Backend.Models;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using System;

namespace CineSense.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // SADECE GİRİŞ YAPMIŞ KULLANICILAR ERİŞEBİLİR
    public class UserProfileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserProfileController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 🔑 Güvenlik: Token'dan o anki kullanıcının ID'sini çıkaran yardımcı metod
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim);
        }

        // --- İZLEME LİSTESİ (WATCHLIST) ---
        
        [HttpPost("watchlist/{movieId}")]
        public async Task<IActionResult> ToggleWatchlist(int movieId)
        {
            int userId = GetCurrentUserId();
            var existing = await _context.Watchlists.FirstOrDefaultAsync(w => w.UserId == userId && w.MovieId == movieId);

            if (existing != null)
            {
                _context.Watchlists.Remove(existing); // Zaten listedeyse çıkar
                await _context.SaveChangesAsync();
                return Ok(new { Message = "Film izleme listesinden çıkarıldı." });
            }

            _context.Watchlists.Add(new WatchlistItem { UserId = userId, MovieId = movieId });
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Film izleme listesine eklendi." });
        }

        // --- PUANLAMA (RATING) ---
        
        [HttpPost("rate")]
        public async Task<IActionResult> RateMovie([FromBody] RateRequest request)
        {
            int userId = GetCurrentUserId();
            var existing = await _context.Ratings.FirstOrDefaultAsync(r => r.UserId == userId && r.MovieId == request.MovieId);

            if (existing != null)
            {
                existing.Score = request.Score; // Varsa güncelle
                existing.RatedAt = DateTime.UtcNow;
            }
            else
            {
                _context.Ratings.Add(new Rating { UserId = userId, MovieId = request.MovieId, Score = request.Score });
            }

            // Filme puan verdiğinde, otomatik olarak izleme geçmişine de ekleyebiliriz
            var historyExists = await _context.ViewingHistories.AnyAsync(h => h.UserId == userId && h.MovieId == request.MovieId);
            if (!historyExists)
            {
                _context.ViewingHistories.Add(new ViewingHistory { UserId = userId, MovieId = request.MovieId });
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Puanınız kaydedildi." });
        }

        // --- KULLANICI PROFİLİ ÖZETİNİ GETİRME ---
        
        [HttpGet("my-profile")]
        public async Task<IActionResult> GetMyProfile()
        {
            int userId = GetCurrentUserId();

            var watchlist = await _context.Watchlists.Include(w => w.Movie)
                .Where(w => w.UserId == userId).Select(w => w.Movie).ToListAsync();

            var history = await _context.ViewingHistories.Include(v => v.Movie)
                .Where(v => v.UserId == userId).OrderByDescending(v => v.WatchedAt).Select(v => v.Movie).ToListAsync();

            var ratings = await _context.Ratings.Include(r => r.Movie)
                .Where(r => r.UserId == userId).Select(r => new { r.Movie.Title, r.Score }).ToListAsync();

            return Ok(new
            {
                Watchlist = watchlist,
                History = history,
                Ratings = ratings
            });
        }
    }

    // Puanlama isteği için DTO
    public class RateRequest
    {
        public int MovieId { get; set; }
        public int Score { get; set; }
    }
}