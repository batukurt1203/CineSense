using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CineSense.Backend.Data;
using System.Linq;
using System.Threading.Tasks;

namespace CineSense.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MovieController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MovieController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string query, [FromQuery] string sortBy = "default")
        {
            var moviesQuery = _context.Movies.AsQueryable();

            // 1. İsim veya Türe Göre Filtreleme
            if (!string.IsNullOrWhiteSpace(query))
            {
                var lowerQuery = query.ToLower();
                moviesQuery = moviesQuery.Where(m => m.Title.ToLower().Contains(lowerQuery) || m.Genres.ToLower().Contains(lowerQuery));
            }

            // 2. Sıralama Seçenekleri (Switch yapısı ile)
            moviesQuery = sortBy switch
            {
                "rating_desc" => moviesQuery.OrderByDescending(m => m.VoteAverage),
                "year_desc"   => moviesQuery.OrderByDescending(m => m.ReleaseDate),
                "year_asc"    => moviesQuery.OrderBy(m => m.ReleaseDate),
                "title_asc"   => moviesQuery.OrderBy(m => m.Title),
                "title_desc"  => moviesQuery.OrderByDescending(m => m.Title),
                _             => moviesQuery // default (veritabanı sırası)
            };

            // En fazla 50 sonuç döndür
            var movies = await moviesQuery.Take(50).ToListAsync();
            return Ok(movies);
        }
    }
}