namespace HotelBookingAPI.Models;

public class Room
{
    public int Id { get; set; }
    public int TotalRooms { get; set; } = 1;
    public string RoomType { get; set; } = string.Empty;       // Single, Double, Suite, Deluxe
    public string Description { get; set; } = string.Empty;
    public decimal PricePerNight { get; set; }
    public int MaxGuests { get; set; }
    public string Amenities { get; set; } = string.Empty;      // JSON-stored list
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<DailyRoomBooking> DailyBookings { get; set; } = new List<DailyRoomBooking>();
}