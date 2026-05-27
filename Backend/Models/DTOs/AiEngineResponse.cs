using System.Collections.Generic;
using System.Text.Json.Serialization; // BU SATIRI EKLEMEYİ UNUTMA

namespace CineSense.Backend.Models.DTOs
{
    public class AiEngineResponse
    {
        // JSON içindeki "recommendedMovieIds" etiketini doğrudan bu listeye bağla
        [JsonPropertyName("recommendedMovieIds")]
        public List<int> RecommendedMovieIds { get; set; } 

        // JSON içindeki "message" etiketini doğrudan bu değişkene bağla
        [JsonPropertyName("message")]
        public string Message { get; set; }
    }
}