using HotelBookingAPI.DTOs;

namespace HotelBookingAPI.Interfaces;

public interface IBookingService
{
    Task<BookingResponseDto> CreateBookingAsync(int customerId, CreateBookingDto dto);
    Task<BookingResponseDto?> GetBookingByIdAsync(int id);
    Task<BookingResponseDto?> GetBookingByReferenceAsync(string reference);
    Task<List<BookingResponseDto>> GetBookingsByCustomerAsync(int customerId);
    Task<List<BookingResponseDto>> GetAllBookingsAsync();
    Task<BookingResponseDto?> CancelBookingAsync(int id, int customerId, CancelBookingDto dto);
    Task<BookingResponseDto?> AdminCancelBookingAsync(int id, CancelBookingDto dto);
    Task ExpirePendingBookingsAsync();
}