using System.ComponentModel.DataAnnotations;

namespace HotelBookingAPI.DTOs;

public class PaymentResponseDto
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public string BookingReference { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? TransactionId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public decimal? RefundAmount { get; set; }
}

public class ProcessPaymentDto
{
    [Required]
    public int BookingId { get; set; }

    [Required]
    public string PaymentMethod { get; set; } = string.Empty;

    // Simulated card/UPI details — in real world these go directly to gateway
    [Required]
    public string PaymentToken { get; set; } = string.Empty;
}