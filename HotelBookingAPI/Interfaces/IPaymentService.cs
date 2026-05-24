using HotelBookingAPI.DTOs;

namespace HotelBookingAPI.Interfaces;

public interface IPaymentService
{
    Task<PaymentResponseDto> ProcessPaymentAsync(int customerId, ProcessPaymentDto dto);
    Task<PaymentResponseDto?> GetPaymentByBookingIdAsync(int bookingId);
    Task<PaymentResponseDto?> RefundPaymentAsync(int bookingId);
}