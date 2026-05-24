namespace HotelBookingAPI.Models;

public class Payment
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;   // CreditCard, DebitCard, UPI, NetBanking
    public string Status { get; set; } = PaymentStatus.Pending; // Pending, Success, Failed, Refunded
    public string? TransactionId { get; set; }
    public string? GatewayResponse { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedAt { get; set; }
    public decimal? RefundAmount { get; set; }
    public DateTime? RefundedAt { get; set; }

    // Navigation
    public Booking Booking { get; set; } = null!;
}

public static class PaymentStatus
{
    public const string Pending = "Pending";
    public const string Success = "Success";
    public const string Failed = "Failed";
    public const string Refunded = "Refunded";
}