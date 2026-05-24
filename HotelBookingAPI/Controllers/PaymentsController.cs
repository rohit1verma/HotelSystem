using System.Security.Claims;
using HotelBookingAPI.DTOs;
using HotelBookingAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBookingAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    // POST /api/payments
    [HttpPost]
    public async Task<IActionResult> Process([FromBody] ProcessPaymentDto dto)
    {
        int customerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var payment = await _paymentService.ProcessPaymentAsync(customerId, dto);
        return Ok(payment);
    }

    // GET /api/payments/booking/{bookingId}
    [HttpGet("booking/{bookingId:int}")]
    public async Task<IActionResult> GetByBooking(int bookingId)
    {
        var payment = await _paymentService.GetPaymentByBookingIdAsync(bookingId);
        return payment is null ? NotFound() : Ok(payment);
    }
}