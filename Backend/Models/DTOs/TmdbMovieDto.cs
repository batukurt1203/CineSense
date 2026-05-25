namespace CineSense.Backend.Models.DTOs;

public class TmdbMovieDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Overview { get; set; }
    public List<TmdbGenreDto> Genres { get; set; }
}

public class TmdbGenreDto
{
    public string Name { get; set; }
}