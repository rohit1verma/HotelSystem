using HotelBookingAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelBookingAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<DailyRoomBooking> DailyRoomBookings => Set<DailyRoomBooking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Room ──────────────────────────────────────────────────────────────
        modelBuilder.Entity<Room>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.RoomType).IsRequired().HasMaxLength(50);
            e.Property(r => r.PricePerNight).HasColumnType("decimal(18,2)");
        });

        // ── DailyRoomBooking ──────────────────────────────────────────────────
        modelBuilder.Entity<DailyRoomBooking>(e =>
        {
            e.HasKey(d => d.Id);
            e.HasIndex(d => new { d.RoomId, d.Date }).IsUnique();
            
            e.HasOne(d => d.Room)
             .WithMany(r => r.DailyBookings)
             .HasForeignKey(d => d.RoomId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Customer ──────────────────────────────────────────────────────────
        modelBuilder.Entity<Customer>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Email).IsRequired().HasMaxLength(150);
            e.Property(c => c.FullName).IsRequired().HasMaxLength(100);
            e.HasIndex(c => c.Email).IsUnique();
        });

        // ── Booking ───────────────────────────────────────────────────────────
        modelBuilder.Entity<Booking>(e =>
        {
            e.HasKey(b => b.Id);
            e.Property(b => b.BookingReference).IsRequired().HasMaxLength(30);
            e.Property(b => b.TotalAmount).HasColumnType("decimal(18,2)");
            e.Property(b => b.RefundAmount).HasColumnType("decimal(18,2)");
            e.HasIndex(b => b.BookingReference).IsUnique();

            e.HasOne(b => b.Customer)
             .WithMany(c => c.Bookings)
             .HasForeignKey(b => b.CustomerId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(b => b.Room)
             .WithMany(r => r.Bookings)
             .HasForeignKey(b => b.RoomId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Payment ───────────────────────────────────────────────────────────
        modelBuilder.Entity<Payment>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Amount).HasColumnType("decimal(18,2)");
            e.Property(p => p.RefundAmount).HasColumnType("decimal(18,2)");

            e.HasOne(p => p.Booking)
             .WithOne(b => b.Payment)
             .HasForeignKey<Payment>(p => p.BookingId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Seed: Admin user ──────────────────────────────────────────────────
        modelBuilder.Entity<Customer>().HasData(new Customer
        {
            Id = 1,
            FullName = "Hotel Admin",
            Email = "admin@hotel.com",
            Phone = "9999999999",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Role = "Admin",
            IsActive = true,
            CreatedAt = new DateTime(2025, 1, 1)
        });

        // ── Seed: Sample rooms ────────────────────────────────────────────────
        modelBuilder.Entity<Room>().HasData(
            new Room
            {
                Id = 1,
                TotalRooms = 10,
                RoomType = "Single",
                Description = "Cozy single room",
                PricePerNight = 1500,
                MaxGuests = 1,
                Amenities = "WiFi,AC,TV",
                ImageUrl = string.Empty,
                IsActive = true,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            new Room
            {
                Id = 2,
                TotalRooms = 5,
                RoomType = "Double",
                Description = "Spacious double room",
                PricePerNight = 2500,
                MaxGuests = 2,
                Amenities = "WiFi,AC,TV,Minibar",
                ImageUrl = string.Empty,
                IsActive = true,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            },
            new Room
            {
                Id = 3,
                TotalRooms = 2,
                RoomType = "Suite",
                Description = "Luxury suite with ocean view",
                PricePerNight = 6000,
                MaxGuests = 4,
                Amenities = "WiFi,AC,TV,Minibar,Jacuzzi,Balcony",
                ImageUrl = string.Empty,
                IsActive = true,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1)
            }
        );
    }
}