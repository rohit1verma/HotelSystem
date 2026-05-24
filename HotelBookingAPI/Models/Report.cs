namespace HotelBookingAPI.Models;

// Not a DB entity — used for report projections
public class BookingSummaryReport
{
    public int TotalBookings { get; set; }
    public int ConfirmedBookings { get; set; }
    public int CancelledBookings { get; set; }
    public int PendingBookings { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal RefundedAmount { get; set; }
    public List<RoomOccupancyReport> RoomOccupancy { get; set; } = new();
}

public class RoomOccupancyReport
{
    public string RoomNumber { get; set; } = string.Empty;
    public string RoomType { get; set; } = string.Empty;
    public int BookingCount { get; set; }
    public decimal Revenue { get; set; }
    public double OccupancyRate { get; set; }
}