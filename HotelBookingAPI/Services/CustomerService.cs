using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HotelBookingAPI.Data;
using HotelBookingAPI.DTOs;
using HotelBookingAPI.Interfaces;
using HotelBookingAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace HotelBookingAPI.Services;

public class JwtSettings
{
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpiryMinutes { get; set; } = 60;
}

public class CustomerService : ICustomerService
{
    private readonly AppDbContext _db;
    private readonly JwtSettings _jwt;

    public CustomerService(AppDbContext db, IOptions<JwtSettings> jwt)
    {
        _db = db;
        _jwt = jwt.Value;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterCustomerDto dto)
    {
        bool emailExists = await _db.Customers.AnyAsync(c => c.Email == dto.Email);
        if (emailExists)
            throw new InvalidOperationException("Email is already registered.");

        var customer = new Customer
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "Customer",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.Customers.Add(customer);
        await _db.SaveChangesAsync();

        return GenerateToken(customer);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Email == dto.Email && c.IsActive);
        if (customer is null || !BCrypt.Net.BCrypt.Verify(dto.Password, customer.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        return GenerateToken(customer);
    }

    public async Task<CustomerResponseDto?> GetCustomerByIdAsync(int id)
    {
        var c = await _db.Customers.FindAsync(id);
        return c is null ? null : MapToDto(c);
    }

    public async Task<List<CustomerResponseDto>> GetAllCustomersAsync()
    {
        var customers = await _db.Customers.ToListAsync();
        return customers.Select(MapToDto).ToList();
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private AuthResponseDto GenerateToken(Customer customer)
    {
        var expiry = DateTime.UtcNow.AddMinutes(_jwt.ExpiryMinutes);
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, customer.Id.ToString()),
            new Claim(ClaimTypes.Email, customer.Email),
            new Claim(ClaimTypes.Name, customer.FullName),
            new Claim(ClaimTypes.Role, customer.Role)
        };

        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            expires: expiry,
            signingCredentials: creds);

        return new AuthResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            FullName = customer.FullName,
            Email = customer.Email,
            Role = customer.Role,
            ExpiresAt = expiry
        };
    }

    private static CustomerResponseDto MapToDto(Customer c) => new()
    {
        Id = c.Id,
        FullName = c.FullName,
        Email = c.Email,
        Phone = c.Phone,
        Role = c.Role,
        CreatedAt = c.CreatedAt
    };
}