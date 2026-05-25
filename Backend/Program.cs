using CineSense.Backend.Data;
using CineSense.Backend.Data.Repositories;
using CineSense.Backend.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// --- 1. Database (PostgreSQL) Configuration ---
// Reads the "DefaultConnection" from appsettings.json and configures EF Core
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// --- 2. CORS (Cross-Origin Resource Sharing) Configuration ---
// Allows the React frontend to communicate with this .NET Backend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Frontend URL
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// --- 3. Dependency Injection (DI) Container ---
// Registers Repositories
builder.Services.AddScoped<IMovieRepository, MovieRepository>();

// Registers HttpClients for external communications (Prevents Socket Exhaustion)
builder.Services.AddHttpClient<IExternalApiService, ExternalApiService>();
builder.Services.AddHttpClient<IAiEngineService, AiEngineService>();

// Registers Core Application Engines
builder.Services.AddScoped<CacheEngine>();

// --- 4. Standard API Services ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

builder.Services.AddHttpClient(); 
builder.Services.AddScoped<CineSense.Backend.Services.TmdbSeederService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // React'in adresi
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var tokenKey = builder.Configuration.GetSection("AppSettings:Token").Value;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

var app = builder.Build();

// --- 5. HTTP Request Pipeline ---

//    app.UseSwagger();
//    app.UseSwaggerUI();
    
//    app.UseHttpsRedirection();

app.UseRouting();
// Applies the CORS policy defined above
app.UseCors("AllowReact");

app.UseAuthorization();
app.UseAuthorization();

// Maps incoming HTTP requests to the respective Controllers (e.g., RecommendationController)
app.MapControllers();

app.MapGet("/", () => "CineSense API Su Anda Kusursuz Calisiyor!");

using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<CineSense.Backend.Services.TmdbSeederService>();
    try
    {
        await seeder.SeedMoviesAsync();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Veritabanı tohumlanırken kritik bir hata oluştu: {ex.Message}");
    }
}

app.Run();