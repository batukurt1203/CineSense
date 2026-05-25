using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using CineSense.Backend.Models;
using CineSense.Backend.Models.DTOs;
using CineSense.Backend.Data; // Kendi DbContext yolunu kontrol et
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CineSense.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto request)
        {
            // E-posta daha önce alınmış mı kontrol et
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { message = "Bu e-posta adresi zaten kullanılıyor." });
            }

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                // Şifreyi BCrypt ile geri döndürülemez şekilde (Hash) şifreliyoruz
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password) 
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Kayıt başarılı! Artık giriş yapabilirsiniz." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            
            // Kullanıcı yoksa veya şifresi uyuşmuyorsa
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Hatalı e-posta veya şifre." });
            }

            var token = CreateToken(user);
            
            return Ok(new { 
                token = token, 
                username = user.Username, 
                role = user.Role,
                message = "Giriş başarılı!" 
            });
        }

        // Güvenli JWT (Bilet) Üretme Metodu
        private string CreateToken(User user)
        {
            // appsettings.json'dan gizli anahtarımızı alacağız
            var tokenKey = _configuration.GetSection("AppSettings:Token").Value;
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey));
            
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            // Biletin içine gömeceğimiz kullanıcı bilgileri
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)    
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1), // Bilet 1 gün sonra geçersiz olacak
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}