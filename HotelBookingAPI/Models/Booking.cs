namespace HotelBookingAPI.Models;

public class Booking
{
    public int Id { get; set; }
    public string BookingReference { get; set; } = string.Empty;  // e.g., HB-20250523-0001
    public int CustomerId { get; set; }
    public int RoomId { get; set; }
    public DateTime CheckInDate { get; set; }
    public DateTime CheckOutDate { get; set; }
    public int NumberOfGuests { get; set; }
    public string? SpecialRequests { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = BookingStatus.Pending;   // Pending, Confirmed, Cancelled, Completed
    public DateTime BookedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }
    public decimal? RefundAmount { get; set; }

    // Navigation
    public Customer Customer { get; set; } = null!;
    public Room Room { get; set; } = null!;
    public Payment? Payment { get; set; }
}

public static class BookingStatus
{
    public const string Pending = "Pending";
    public const string Confirmed = "Confirmed";
    public const string Cancelled = "Cancelled";
    public const string Completed = "Completed";
}