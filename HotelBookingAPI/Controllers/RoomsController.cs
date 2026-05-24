using HotelBookingAPI.DTOs;
using HotelBookingAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBookingAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly IRoomService _roomService;

    public RoomsController(IRoomService roomService)
    {
        _roomService = roomService;
    }

    // POST /api/rooms/search
    [HttpPost("search")]
    public async Task<IActionResult> Search([FromBody] RoomSearchDto dto)
    {
        var results = await _roomService.SearchAvailableRoomsAsync(dto);
        return Ok(results);
    }

    // GET /api/rooms/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var room = await _roomService.GetRoomByIdAsync(id);
        return room is null ? NotFound() : Ok(room);
    }

    // GET /api/rooms
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var rooms = await _roomService.GetAllRoomsAsync();
        return Ok(rooms);
    }
}