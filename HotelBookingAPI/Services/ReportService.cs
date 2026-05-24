using HotelBookingAPI.Data;
using HotelBookingAPI.Interfaces;
using HotelBookingAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingAPI.Services;

public class ReportService : IReportService
{
    private readonly AppDbContext _db;

    public ReportService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<BookingSummaryReport> GetSummaryReportAsync(DateTime? from, DateTime? to)
    {
        var query = _db.Bookings
            .Include(b => b.Room)
            .Include(b => b.Payment)
            .AsQueryable();

        if (from.HasValue)
            query = query.Where(b => b.BookedAt >= from.Value);
        if (to.HasValue)
            query = query.Where(b => b.BookedAt <= to.Value);

        var bookings = await query.ToListAsync();

        var report = new BookingSummaryReport
        {
            TotalBookings = bookings.Count,
            ConfirmedBookings = bookings.Count(b => b.Status == BookingStatus.Confirmed),
            CancelledBookings = bookings.Count(b => b.Status == BookingStatus.Cancelled),
            PendingBookings = bookings.Count(b => b.Status == BookingStatus.Pending),
            TotalRevenue = bookings
                .Where(b => b.Payment?.Status == PaymentStatus.Success)
                .Sum(b => b.TotalAmount),
            RefundedAmount = bookings
                .Where(b => b.Payment?.Status == PaymentStatus.Refunded)
                .Sum(b => b.Payment!.RefundAmount ?? 0)
        };

        report.RoomOccupancy = bookings
            .Where(b => b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.Completed)
            .GroupBy(b => b.RoomId)
            .Select(g =>
            {
                var room = g.First().Room;
                return new RoomOccupancyReport
                {
                    RoomNumber = room.RoomNumber,
                    RoomType = room.RoomType,
                    BookingCount = g.Count(),
                    Revenue = g.Sum(b => b.TotalAmount),
                    OccupancyRate = Math.Round((double)g.Count() / (bookings.Count == 0 ? 1 : bookings.Count) * 100, 2)
                };
            })
            .OrderByDescending(r => r.BookingCount)
            .ToList();

        return report;
    }
}