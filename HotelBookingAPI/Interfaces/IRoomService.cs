using HotelBookingAPI.DTOs;

namespace HotelBookingAPI.Interfaces;

public interface IRoomService
{
    Task<List<AvailableRoomDto>> SearchAvailableRoomsAsync(RoomSearchDto searchDto);
    Task<RoomResponseDto?> GetRoomByIdAsync(int id);
    Task<List<RoomResponseDto>> GetAllRoomsAsync();
    Task<RoomResponseDto> CreateRoomAsync(CreateRoomDto dto);
    Task<RoomResponseDto?> UpdateRoomAsync(int id, UpdateRoomDto dto);
    Task<bool> DeleteRoomAsync(int id);
}