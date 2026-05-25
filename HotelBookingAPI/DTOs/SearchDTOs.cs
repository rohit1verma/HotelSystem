using System.ComponentModel.DataAnnotations;

namespace HotelBookingAPI.DTOs;

public class RoomSearchDto
{
    [Required]
    public DateTime CheckInDate { get; set; }

    [Required]
    public DateTime CheckOutDate { get; set; }

    [Required]
    [Range(1, 20)]
    public int NumberOfGuests { get; set; }

    [Required]
    [Range(1, 100)]
    public int NumberOfRooms { get; set; } = 1;

    public string? RoomType { get; set; }
    public decimal? MaxPricePerNight { get; set; }
}

public class AvailableRoomDto
{
    public int RoomId { get; set; }
    public int AvailableRooms { get; set; }
    public string RoomType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal PricePerNight { get; set; }
    public decimal TotalPrice { get; set; }
    public int NumberOfNights { get; set; }
    public int MaxGuests { get; set; }
    public string Amenities { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
}