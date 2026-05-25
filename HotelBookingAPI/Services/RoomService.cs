using HotelBookingAPI.Data;
using HotelBookingAPI.DTOs;
using HotelBookingAPI.Interfaces;
using HotelBookingAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingAPI.Services;

public class RoomService : IRoomService
{
    private readonly AppDbContext _db;

    public RoomService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<AvailableRoomDto>> SearchAvailableRoomsAsync(RoomSearchDto dto)
    {
        if (dto.CheckOutDate <= dto.CheckInDate)
            throw new ArgumentException("Check-out date must be after check-in date.");

        int nights = (int)(dto.CheckOutDate - dto.CheckInDate).TotalDays;

        var baseQuery = _db.Rooms
            .Where(r => r.IsActive && r.MaxGuests >= dto.NumberOfGuests);

        if (!string.IsNullOrWhiteSpace(dto.RoomType))
            baseQuery = baseQuery.Where(r => r.RoomType == dto.RoomType);

        if (dto.MaxPricePerNight.HasValue)
            baseQuery = baseQuery.Where(r => r.PricePerNight <= dto.MaxPricePerNight.Value);

        var rooms = await baseQuery.ToListAsync();

        var availableRoomsData = new List<(Room Room, int Available)>();

        foreach (var room in rooms)
        {
            var dailyBookings = await _db.DailyRoomBookings
                .Where(d => d.RoomId == room.Id && d.Date >= dto.CheckInDate && d.Date < dto.CheckOutDate)
                .ToListAsync();

            int maxBooked = dailyBookings.Count > 0 ? dailyBookings.Max(d => d.BookedQuantity) : 0;
            int availableCount = room.TotalRooms - maxBooked;

            if (availableCount >= dto.NumberOfRooms)
            {
                availableRoomsData.Add((room, availableCount));
            }
        }

        return availableRoomsData.Select(r => new AvailableRoomDto
        {
            RoomId = r.Room.Id,
            AvailableRooms = r.Available,
            RoomType = r.Room.RoomType,
            Description = r.Room.Description,
            PricePerNight = r.Room.PricePerNight,
            TotalPrice = r.Room.PricePerNight * nights,
            NumberOfNights = nights,
            MaxGuests = r.Room.MaxGuests,
            Amenities = r.Room.Amenities,
            ImageUrl = r.Room.ImageUrl
        }).ToList();
    }

    public async Task<RoomResponseDto?> GetRoomByIdAsync(int id)
    {
        var room = await _db.Rooms.FindAsync(id);
        return room is null ? null : MapToDto(room);
    }

    public async Task<List<RoomResponseDto>> GetAllRoomsAsync()
    {
        var rooms = await _db.Rooms.ToListAsync();
        return rooms.Select(MapToDto).ToList();
    }

    public async Task<RoomResponseDto> CreateRoomAsync(CreateRoomDto dto)
    {
        var room = new Room
        {
            TotalRooms = dto.TotalRooms,
            RoomType = dto.RoomType,
            Description = dto.Description,
            PricePerNight = dto.PricePerNight,
            MaxGuests = dto.MaxGuests,
            Amenities = dto.Amenities,
            ImageUrl = dto.ImageUrl,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Rooms.Add(room);
        await _db.SaveChangesAsync();
        return MapToDto(room);
    }

    public async Task<RoomResponseDto?> UpdateRoomAsync(int id, UpdateRoomDto dto)
    {
        var room = await _db.Rooms.FindAsync(id);
        if (room is null) return null;

        if (dto.TotalRooms.HasValue) room.TotalRooms = dto.TotalRooms.Value;
        if (dto.RoomType is not null) room.RoomType = dto.RoomType;
        if (dto.Description is not null) room.Description = dto.Description;
        if (dto.PricePerNight.HasValue) room.PricePerNight = dto.PricePerNight.Value;
        if (dto.MaxGuests.HasValue) room.MaxGuests = dto.MaxGuests.Value;
        if (dto.Amenities is not null) room.Amenities = dto.Amenities;
        if (dto.ImageUrl is not null) room.ImageUrl = dto.ImageUrl;
        if (dto.IsActive.HasValue) room.IsActive = dto.IsActive.Value;
        room.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return MapToDto(room);
    }

    public async Task<bool> DeleteRoomAsync(int id)
    {
        var room = await _db.Rooms.FindAsync(id);
        if (room is null) return false;

        // Soft delete
        room.IsActive = false;
        room.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    private static RoomResponseDto MapToDto(Room r) => new()
    {
        Id = r.Id,
        TotalRooms = r.TotalRooms,
        RoomType = r.RoomType,
        Description = r.Description,
        PricePerNight = r.PricePerNight,
        MaxGuests = r.MaxGuests,
        Amenities = r.Amenities,
        ImageUrl = r.ImageUrl,
        IsActive = r.IsActive
    };
}