using HotelBookingAPI.Data;
using HotelBookingAPI.DTOs;
using HotelBookingAPI.Interfaces;
using HotelBookingAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace HotelBookingAPI.Services;

public class BookingSettings
{
    public int PendingPaymentExpiryMinutes { get; set; } = 15;
    public int DefaultCancellationRefundPercent { get; set; } = 80;
}

public class BookingService : IBookingService
{
    private readonly AppDbContext _db;
    private readonly BookingSettings _settings;

    public BookingService(AppDbContext db, IOptions<BookingSettings> settings)
    {
        _db = db;
        _settings = settings.Value;
    }

    public async Task<BookingResponseDto> CreateBookingAsync(int customerId, CreateBookingDto dto)
    {
        if (dto.CheckOutDate <= dto.CheckInDate)
            throw new ArgumentException("Check-out date must be after check-in date.");

        if (dto.CheckInDate.Date < DateTime.UtcNow.Date)
            throw new ArgumentException("Check-in date cannot be in the past.");

        var room = await _db.Rooms.FindAsync(dto.RoomId)
            ?? throw new KeyNotFoundException("Room not found.");

        if (!room.IsActive)
            throw new InvalidOperationException("Room is not available.");

        if (room.MaxGuests < dto.NumberOfGuests)
            throw new InvalidOperationException($"Room supports max {room.MaxGuests} guests.");

        // Check availability
        bool isConflict = await _db.Bookings.AnyAsync(b =>
            b.RoomId == dto.RoomId &&
            b.Status != BookingStatus.Cancelled &&
            b.CheckInDate < dto.CheckOutDate &&
            b.CheckOutDate > dto.CheckInDate);

        if (isConflict)
            throw new InvalidOperationException("Room is not available for the selected dates.");

        int nights = (int)(dto.CheckOutDate - dto.CheckInDate).TotalDays;
        decimal total = room.PricePerNight * nights;

        var booking = new Booking
        {
            BookingReference = GenerateReference(),
            CustomerId = customerId,
            RoomId = dto.RoomId,
            CheckInDate = dto.CheckInDate,
            CheckOutDate = dto.CheckOutDate,
            NumberOfGuests = dto.NumberOfGuests,
            SpecialRequests = dto.SpecialRequests,
            TotalAmount = total,
            Status = BookingStatus.Pending,
            BookedAt = DateTime.UtcNow
        };

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync();

        return await BuildResponseDto(booking);
    }

    public async Task<BookingResponseDto?> GetBookingByIdAsync(int id)
    {
        var booking = await _db.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Room)
            .Include(b => b.Payment)
            .FirstOrDefaultAsync(b => b.Id == id);

        return booking is null ? null : await BuildResponseDto(booking);
    }

    public async Task<BookingResponseDto?> GetBookingByReferenceAsync(string reference)
    {
        var booking = await _db.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Room)
            .Include(b => b.Payment)
            .FirstOrDefaultAsync(b => b.BookingReference == reference);

        return booking is null ? null : await BuildResponseDto(booking);
    }

    public async Task<List<BookingResponseDto>> GetBookingsByCustomerAsync(int customerId)
    {
        var bookings = await _db.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Room)
            .Include(b => b.Payment)
            .Where(b => b.CustomerId == customerId)
            .OrderByDescending(b => b.BookedAt)
            .ToListAsync();

        var tasks = bookings.Select(b => BuildResponseDto(b));
        return (await Task.WhenAll(tasks)).ToList();
    }

    public async Task<List<BookingResponseDto>> GetAllBookingsAsync()
    {
        var bookings = await _db.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Room)
            .Include(b => b.Payment)
            .OrderByDescending(b => b.BookedAt)
            .ToListAsync();

        var tasks = bookings.Select(b => BuildResponseDto(b));
        return (await Task.WhenAll(tasks)).ToList();
    }

    public async Task<BookingResponseDto?> CancelBookingAsync(int id, int customerId, CancelBookingDto dto)
    {
        var booking = await _db.Bookings
            .Include(b => b.Payment)
            .FirstOrDefaultAsync(b => b.Id == id && b.CustomerId == customerId);

        if (booking is null) return null;

        return await CancelAndRefund(booking, dto.CancellationReason);
    }

    public async Task<BookingResponseDto?> AdminCancelBookingAsync(int id, CancelBookingDto dto)
    {
        var booking = await _db.Bookings
            .Include(b => b.Payment)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking is null) return null;

        return await CancelAndRefund(booking, dto.CancellationReason);
    }

    public async Task ExpirePendingBookingsAsync()
    {
        var expiry = DateTime.UtcNow.AddMinutes(-_settings.PendingPaymentExpiryMinutes);
        var stale = await _db.Bookings
            .Where(b => b.Status == BookingStatus.Pending && b.BookedAt < expiry)
            .ToListAsync();

        foreach (var b in stale)
        {
            b.Status = BookingStatus.Cancelled;
            b.CancelledAt = DateTime.UtcNow;
            b.CancellationReason = "Auto-cancelled: payment not completed in time.";
        }

        if (stale.Count > 0)
            await _db.SaveChangesAsync();
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private async Task<BookingResponseDto> CancelAndRefund(Booking booking, string? reason)
    {
        if (booking.Status == BookingStatus.Cancelled)
            throw new InvalidOperationException("Booking is already cancelled.");

        decimal refund = 0;
        if (booking.Payment?.Status == PaymentStatus.Success)
        {
            refund = booking.TotalAmount * _settings.DefaultCancellationRefundPercent / 100;
            booking.Payment.Status = PaymentStatus.Refunded;
            booking.Payment.RefundAmount = refund;
            booking.Payment.RefundedAt = DateTime.UtcNow;
        }

        booking.Status = BookingStatus.Cancelled;
        booking.CancelledAt = DateTime.UtcNow;
        booking.CancellationReason = reason;
        booking.RefundAmount = refund;

        await _db.SaveChangesAsync();

        // Re-load navigation props for the response
        await _db.Entry(booking).Reference(b => b.Customer).LoadAsync();
        await _db.Entry(booking).Reference(b => b.Room).LoadAsync();

        return await BuildResponseDto(booking);
    }

    private static string GenerateReference()
    {
        var date = DateTime.UtcNow.ToString("yyyyMMdd");
        var rand = Random.Shared.Next(1000, 9999);
        return $"HB-{date}-{rand}";
    }

    private static Task<BookingResponseDto> BuildResponseDto(Booking b)
    {
        int nights = (int)(b.CheckOutDate - b.CheckInDate).TotalDays;
        var dto = new BookingResponseDto
        {
            Id = b.Id,
            BookingReference = b.BookingReference,
            CustomerId = b.CustomerId,
            CustomerName = b.Customer?.FullName ?? string.Empty,
            RoomId = b.RoomId,
            RoomNumber = b.Room?.RoomNumber ?? string.Empty,
            RoomType = b.Room?.RoomType ?? string.Empty,
            CheckInDate = b.CheckInDate,
            CheckOutDate = b.CheckOutDate,
            NumberOfNights = nights,
            NumberOfGuests = b.NumberOfGuests,
            SpecialRequests = b.SpecialRequests,
            TotalAmount = b.TotalAmount,
            Status = b.Status,
            BookedAt = b.BookedAt,
            PaymentStatus = b.Payment?.Status
        };
        return Task.FromResult(dto);
    }
}