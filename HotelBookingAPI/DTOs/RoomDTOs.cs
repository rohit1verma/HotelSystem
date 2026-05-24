using System.ComponentModel.DataAnnotations;

namespace HotelBookingAPI.DTOs;

public class RoomResponseDto
{
    public int Id { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string RoomType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal PricePerNight { get; set; }
    public int MaxGuests { get; set; }
    public string Amenities { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class CreateRoomDto
{
    [Required]
    [MaxLength(10)]
    public string RoomNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string RoomType { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [Range(1, 100000)]
    public decimal PricePerNight { get; set; }

    [Required]
    [Range(1, 20)]
    public int MaxGuests { get; set; }

    public string Amenities { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
}

public class UpdateRoomDto
{
    [MaxLength(50)]
    public string? RoomType { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    [Range(1, 100000)]
    public decimal? PricePerNight { get; set; }

    [Range(1, 20)]
    public int? MaxGuests { get; set; }

    public string? Amenities { get; set; }
    public string? ImageUrl { get; set; }
    public bool? IsActive { get; set; }
}