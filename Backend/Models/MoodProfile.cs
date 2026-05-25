namespace CineSense.Backend.Models
{
    public class MoodProfile
    {
        // Örn: "Mutlu", "Melankolik", "Maceraperest"
        public string CurrentMood { get; set; } 
        
        // Örn: 120 (Kullanıcının 2 saati var, 3 saatlik Yüzüklerin Efendisi önerilmeyecek)
        public int AvailableTimeMinutes { get; set; } 
        
        // Örn: "Alone" (Yalnız), "Friends" (Arkadaşlarla), "DateNight" (Sevgiliyle)
        public string SocialContext { get; set; } 
    }
}