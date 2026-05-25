namespace HotelBookingAPI.Models;

public class DailyRoomBooking
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public DateTime Date { get; set; }
    public int BookedQuantity { get; set; }

    // Navigation
    public Room Room { get; set; } = null!;
}
