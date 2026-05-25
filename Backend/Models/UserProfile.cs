using System.ComponentModel.DataAnnotations;

namespace CineSense.Backend.DTOs
{
    /// <summary>
    /// Kullanıcının anlık ruh hali, zaman kısıtı ve sosyal bağlam verilerini 
    /// Frontend'den Backend'e taşımak için kullanılan Veri Transfer Nesnesi (DTO).
    /// </summary>
    public class UserProfile
    {
        // Örn: "Mutlu", "Melankolik", "Maceraperest"
        [Required(ErrorMessage = "Ruh hali alanı boş bırakılamaz.")]
        [StringLength(50, ErrorMessage = "Ruh hali ifadesi en fazla 50 karakter olabilir.")]
        public string CurrentMood { get; set; } = string.Empty;

        // Örn: 120 dakika (Ankete girilen süre kısıtı)
        [Range(30, 300, ErrorMessage = "Süre kısıtı 30 ile 300 dakika arasında olmalıdır.")]
        public int AvailableTimeMinutes { get; set; }

        // Örn: "Alone", "Friends", "DateNight", "Family"
        [Required(ErrorMessage = "Sosyal bağlam (kiminle izleneceği) alanı boş bırakılamaz.")]
        public string SocialContext { get; set; } = string.Empty;
    }
}