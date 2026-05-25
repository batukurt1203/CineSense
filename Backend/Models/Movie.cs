using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CineSense.Backend.Models
{
    public class Movie
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)] // ID'leri TMDB'den alacağımız için otomatik artan yapmıyoruz
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string Title { get; set; }

        [Required]
        public string Overview { get; set; }

        // Türleri veritabanında basitçe virgülle ayrılmış metin olarak tutabiliriz (Örn: "Aksiyon, Bilim Kurgu")
        [Required]
        public string Genres { get; set; }
    }
}