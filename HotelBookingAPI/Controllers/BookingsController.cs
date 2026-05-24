using System.Security.Claims;
using HotelBookingAPI.DTOs;
using HotelBookingAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBookingAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingsController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    // POST /api/bookings
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookingDto dto)
    {
        int customerId = GetCustomerId();
        var booking = await _bookingService.CreateBookingAsync(customerId, dto);
        return CreatedAtAction(nameof(GetById), new { id = booking.Id }, booking);
    }

    // GET /api/bookings/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var booking = await _bookingService.GetBookingByIdAsync(id);
        if (booking is null) return NotFound();

        // Customers can only view their own bookings
        if (!IsAdmin() && booking.CustomerId != GetCustomerId())
            return Forbid();

        return Ok(booking);
    }

    // GET /api/bookings/reference/{ref}
    [HttpGet("reference/{reference}")]
    public async Task<IActionResult> GetByReference(string reference)
    {
        var booking = await _bookingService.GetBookingByReferenceAsync(reference);
        if (booking is null) return NotFound();

        if (!IsAdmin() && booking.CustomerId != GetCustomerId())
            return Forbid();

        return Ok(booking);
    }

    // GET /api/bookings/my
    [HttpGet("my")]
    public async Task<IActionResult> GetMyBookings()
    {
        int customerId = GetCustomerId();
        var bookings = await _bookingService.GetBookingsByCustomerAsync(customerId);
        return Ok(bookings);
    }

    // POST /api/bookings/{id}/cancel
    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id, [FromBody] CancelBookingDto dto)
    {
        int customerId = GetCustomerId();
        var booking = await _bookingService.CancelBookingAsync(id, customerId, dto);
        return booking is null ? NotFound() : Ok(booking);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private int GetCustomerId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private bool IsAdmin() =>
        User.FindFirstValue(ClaimTypes.Role) == "Admin";
}