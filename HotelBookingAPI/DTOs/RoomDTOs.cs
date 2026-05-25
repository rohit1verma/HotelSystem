using System.ComponentModel.DataAnnotations;

namespace HotelBookingAPI.DTOs;

public class RoomResponseDto
{
    public int Id { get; set; }
    public int TotalRooms { get; set; }
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
    [Range(1, 1000)]
    public int TotalRooms { get; set; } = 1;

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
    public int? TotalRooms { get; set; }

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