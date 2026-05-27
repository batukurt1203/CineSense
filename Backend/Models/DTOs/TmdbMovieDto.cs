using System.Text.Json.Serialization;

namespace CineSense.Backend.Models.DTOs;

public class TmdbMovieDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Overview { get; set; }
    public List<TmdbGenreDto> Genres { get; set; }
    
    [JsonPropertyName("release_date")]
    public string ReleaseDate { get; set; }
        
    [JsonPropertyName("vote_average")]
    public double VoteAverage { get; set; }
}

public class TmdbGenreDto
{
    public string Name { get; set; }
}