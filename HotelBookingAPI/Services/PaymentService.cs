using HotelBookingAPI.Data;
using HotelBookingAPI.DTOs;
using HotelBookingAPI.Interfaces;
using HotelBookingAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingAPI.Services;

public class PaymentService : IPaymentService
{
    private readonly AppDbContext _db;

    public PaymentService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PaymentResponseDto> ProcessPaymentAsync(int customerId, ProcessPaymentDto dto)
    {
        var booking = await _db.Bookings
            .Include(b => b.Payment)
            .Include(b => b.Room)
            .FirstOrDefaultAsync(b => b.Id == dto.BookingId && b.CustomerId == customerId)
            ?? throw new KeyNotFoundException("Booking not found.");

        if (booking.Status != BookingStatus.Pending)
            throw new InvalidOperationException($"Booking is in '{booking.Status}' state. Only Pending bookings can be paid.");

        if (booking.Payment is not null && booking.Payment.Status == PaymentStatus.Success)
            throw new InvalidOperationException("Payment has already been completed for this booking.");

        // ── Simulate gateway call ─────────────────────────────────────────────
        var (success, transactionId, gatewayMsg) = SimulateGateway(dto.PaymentToken);

        var payment = booking.Payment ?? new Payment
        {
            BookingId = booking.Id,
            Amount = booking.TotalAmount,
            CreatedAt = DateTime.UtcNow
        };

        payment.PaymentMethod = dto.PaymentMethod;
        payment.TransactionId = transactionId;
        payment.GatewayResponse = gatewayMsg;
        payment.ProcessedAt = DateTime.UtcNow;

        if (success)
        {
            payment.Status = PaymentStatus.Success;
            booking.Status = BookingStatus.Confirmed;
        }
        else
        {
            payment.Status = PaymentStatus.Failed;
            // Leave booking Pending so user can retry
        }

        if (booking.Payment is null)
            _db.Payments.Add(payment);

        await _db.SaveChangesAsync();

        if (!success)
            throw new InvalidOperationException($"Payment failed: {gatewayMsg}");

        return MapToDto(payment, booking.BookingReference);
    }

    public async Task<PaymentResponseDto?> GetPaymentByBookingIdAsync(int bookingId)
    {
        var payment = await _db.Payments
            .Include(p => p.Booking)
            .FirstOrDefaultAsync(p => p.BookingId == bookingId);

        return payment is null ? null : MapToDto(payment, payment.Booking.BookingReference);
    }

    public async Task<PaymentResponseDto?> RefundPaymentAsync(int bookingId)
    {
        var payment = await _db.Payments
            .Include(p => p.Booking)
            .FirstOrDefaultAsync(p => p.BookingId == bookingId);

        if (payment is null) return null;

        if (payment.Status != PaymentStatus.Success)
            throw new InvalidOperationException("Only successful payments can be refunded.");

        payment.Status = PaymentStatus.Refunded;
        payment.RefundAmount = payment.Amount;
        payment.RefundedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return MapToDto(payment, payment.Booking.BookingReference);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    /// <summary>
    /// Simulates a payment gateway. Tokens starting with "FAIL" simulate a failure.
    /// </summary>
    private static (bool success, string transactionId, string message) SimulateGateway(string token)
    {
        if (token.StartsWith("FAIL", StringComparison.OrdinalIgnoreCase))
            return (false, string.Empty, "Card declined by issuer.");

        var txId = $"TXN-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}";
        return (true, txId, "Payment authorised.");
    }

    private static PaymentResponseDto MapToDto(Payment p, string reference) => new()
    {
        Id = p.Id,
        BookingId = p.BookingId,
        BookingReference = reference,
        Amount = p.Amount,
        PaymentMethod = p.PaymentMethod,
        Status = p.Status,
        TransactionId = p.TransactionId,
        CreatedAt = p.CreatedAt,
        ProcessedAt = p.ProcessedAt,
        RefundAmount = p.RefundAmount
    };
}