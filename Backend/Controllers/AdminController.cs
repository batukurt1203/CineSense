using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CineSense.Backend.Data; // Kendi DbContext yolunu kontrol et
using System.Threading.Tasks;

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
    }
}