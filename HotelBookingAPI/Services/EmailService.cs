using HotelBookingAPI.Interfaces;

namespace HotelBookingAPI.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public Task SendEmailAsync(string to, string subject, string body)
    {
        // In a real application, you would integrate SendGrid, SMTP, AWS SES, etc. here.
        _logger.LogInformation($"[EmailService] Sending email to {to}");
        _logger.LogInformation($"[EmailService] Subject: {subject}");
        _logger.LogInformation($"[EmailService] Body: {body}");

        return Task.CompletedTask;
    }
}
