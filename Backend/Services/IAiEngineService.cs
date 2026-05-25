using CineSense.Backend.Models.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CineSense.Backend.Services
{
    public interface IAiEngineService
    {
        // Controller'dan gelen kullanıcı ID'leri ve profili alıp sonucu dönen metodumuz
        Task<AiEngineResponse> GetRecommendationAsync(List<int> userFavoriteIds, UserProfileDto profile);
    }
}