using HotelBookingAPI.DTOs;
using HotelBookingAPI.Interfaces;
using HotelBookingAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBookingAPI.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IRoomService _roomService;
    private readonly IBookingService _bookingService;
    private readonly ICustomerService _customerService;
    private readonly IPaymentService _paymentService;
    private readonly IReportService _reportService;

    public AdminController(
        IRoomService roomService,
        IBookingService bookingService,
        ICustomerService customerService,
        IPaymentService paymentService,
        IReportService reportService)
    {
        _roomService = roomService;
        _bookingService = bookingService;
        _customerService = customerService;
        _paymentService = paymentService;
        _reportService = reportService;
    }

    // ── Room Management ───────────────────────────────────────────────────────

    // POST /api/admin/rooms
    [HttpPost("rooms")]
    public async Task<IActionResult> CreateRoom([FromBody] CreateRoomDto dto)
    {
        var room = await _roomService.CreateRoomAsync(dto);
        return CreatedAtAction(nameof(GetRoom), new { id = room.Id }, room);
    }

    // GET /api/admin/rooms/{id}
    [HttpGet("rooms/{id:int}")]
    public async Task<IActionResult> GetRoom(int id)
    {
        var room = await _roomService.GetRoomByIdAsync(id);
        return room is null ? NotFound() : Ok(room);
    }

    // GET /api/admin/rooms
    [HttpGet("rooms")]
    public async Task<IActionResult> GetAllRooms()
    {
        var rooms = await _roomService.GetAllRoomsAsync();
        return Ok(rooms);
    }

    // PUT /api/admin/rooms/{id}
    [HttpPut("rooms/{id:int}")]
    public async Task<IActionResult> UpdateRoom(int id, [FromBody] UpdateRoomDto dto)
    {
        var room = await _roomService.UpdateRoomAsync(id, dto);
        return room is null ? NotFound() : Ok(room);
    }

    // DELETE /api/admin/rooms/{id}
    [HttpDelete("rooms/{id:int}")]
    public async Task<IActionResult> DeleteRoom(int id)
    {
        var deleted = await _roomService.DeleteRoomAsync(id);
        return deleted ? NoContent() : NotFound();
    }

    // ── Booking Management ────────────────────────────────────────────────────

    // GET /api/admin/bookings
    [HttpGet("bookings")]
    public async Task<IActionResult> GetAllBookings()
    {
        var bookings = await _bookingService.GetAllBookingsAsync();
        return Ok(bookings);
    }

    // POST /api/admin/bookings/{id}/cancel
    [HttpPost("bookings/{id:int}/cancel")]
    public async Task<IActionResult> CancelBooking(int id, [FromBody] CancelBookingDto dto)
    {
        var booking = await _bookingService.AdminCancelBookingAsync(id, dto);
        return booking is null ? NotFound() : Ok(booking);
    }

    // POST /api/admin/bookings/expire-pending
    [HttpPost("bookings/expire-pending")]
    public async Task<IActionResult> ExpirePending()
    {
        await _bookingService.ExpirePendingBookingsAsync();
        return Ok(new { message = "Stale pending bookings have been expired." });
    }

    // ── Customer Management ───────────────────────────────────────────────────

    // GET /api/admin/customers
    [HttpGet("customers")]
    public async Task<IActionResult> GetAllCustomers()
    {
        var customers = await _customerService.GetAllCustomersAsync();
        return Ok(customers);
    }

    // ── Payment Management ────────────────────────────────────────────────────

    // POST /api/admin/payments/booking/{bookingId}/refund
    [HttpPost("payments/booking/{bookingId:int}/refund")]
    public async Task<IActionResult> Refund(int bookingId)
    {
        var payment = await _paymentService.RefundPaymentAsync(bookingId);
        return payment is null ? NotFound() : Ok(payment);
    }

    // ── Reports ───────────────────────────────────────────────────────────────

    // GET /api/admin/reports/summary?from=2025-01-01&to=2025-12-31
    [HttpGet("reports/summary")]
    public async Task<IActionResult> SummaryReport([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var report = await _reportService.GetSummaryReportAsync(from, to);
        return Ok(report);
    }
}