// IExternalApiService.cs
using CineSense.Backend.Models;
using System.Threading.Tasks;

namespace CineSense.Backend.Services
{
    public interface IExternalApiService
    {
        /// <summary>
        /// Tek bir filmin detaylarını TMDB API üzerinden sorgular.
        /// </summary>
        Task<Movie?> FetchMovieDetailsFromApiAsync(int movieId);
    }
}