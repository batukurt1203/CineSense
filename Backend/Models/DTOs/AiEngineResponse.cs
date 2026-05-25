using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace CineSense.Backend.Models.DTOs
{
    public class AiEngineResponse
    {
        // Python'dan "recommended_movie_ids" olarak gelecek JSON verisini 
        // C# standartlarına uygun isimlendirmeyle (PascalCase) eşleştiriyoruz.
        [JsonPropertyName("recommendedMovieId")]
        public int RecommendedMovieId { get; set; }
        
        [JsonPropertyName("recommendedMovieTitle")]
        public string RecommendedMovieTitle { get; set; }
        
        [JsonPropertyName("message")]
        public string Message { get; set; }
    }
}