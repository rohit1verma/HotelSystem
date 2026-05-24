using HotelBookingAPI.Models;

namespace HotelBookingAPI.Interfaces;

public interface IReportService
{
    Task<BookingSummaryReport> GetSummaryReportAsync(DateTime? from, DateTime? to);
}