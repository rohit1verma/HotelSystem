using HotelBookingAPI.DTOs;

namespace HotelBookingAPI.Interfaces;

public interface ICustomerService
{
    Task<AuthResponseDto> RegisterAsync(RegisterCustomerDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<CustomerResponseDto?> GetCustomerByIdAsync(int id);
    Task<List<CustomerResponseDto>> GetAllCustomersAsync();
}