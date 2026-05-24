using HotelBookingAPI.DTOs;
using HotelBookingAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBookingAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomersController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    // POST /api/customers/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterCustomerDto dto)
    {
        var result = await _customerService.RegisterAsync(dto);
        return Ok(result);
    }

    // POST /api/customers/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _customerService.LoginAsync(dto);
        return Ok(result);
    }

    // GET /api/customers/{id}
    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        // Customers can only view their own profile; admins can view all
        var callerId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)!.Value;

        if (role != "Admin" && callerId != id)
            return Forbid();

        var customer = await _customerService.GetCustomerByIdAsync(id);
        return customer is null ? NotFound() : Ok(customer);
    }
}