using System.ComponentModel.DataAnnotations;

namespace HotelBookingAPI.DTOs;

public class BookingResponseDto
{
    public int Id { get; set; }
    public string BookingReference { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int RoomId { get; set; }
    public int Quantity { get; set; }
    public string RoomType { get; set; } = string.Empty;
    public DateTime CheckInDate { get; set; }
    public DateTime CheckOutDate { get; set; }
    public int NumberOfNights { get; set; }
    public int NumberOfGuests { get; set; }
    public string? SpecialRequests { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime BookedAt { get; set; }
    public string? PaymentStatus { get; set; }
}

public class CreateBookingDto
{
    [Required]
    public int RoomId { get; set; }

    [Required]
    [Range(1, 100)]
    public int Quantity { get; set; } = 1;

    [Required]
    public DateTime CheckInDate { get; set; }

    [Required]
    public DateTime CheckOutDate { get; set; }

    [Required]
    [Range(1, 20)]
    public int NumberOfGuests { get; set; }

    [MaxLength(500)]
    public string? SpecialRequests { get; set; }
}

public class CancelBookingDto
{
    [MaxLength(300)]
    public string? CancellationReason { get; set; }
}