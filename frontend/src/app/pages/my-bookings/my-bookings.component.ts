import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BookingService } from '../../core/services/booking.service';
import { LoaderService } from '../../core/services/loader.service';
import { AlertService } from '../../core/services/alert.service';
import { BookingResponseDto } from '../../core/models/booking.model';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.css'
})
export class MyBookingsComponent implements OnInit {
  private bookingService = inject(BookingService);
  private loaderService = inject(LoaderService);
  private alertService = inject(AlertService);

  bookings = signal<BookingResponseDto[]>([]);

  ngOnInit(): void {
    this.loadBookings();
  }

  // Load customer reservations list and sort by date descending
  loadBookings(): void {
    this.loaderService.show();
    this.bookingService.getMyBookings().subscribe({
      next: (list) => {
        this.loaderService.hide();
        const sorted = list.sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime());
        this.bookings.set(sorted);
      },
      error: (err) => {
        this.loaderService.hide();
        this.alertService.showAlert('Could not fetch reservation logs.', 'error');
      }
    });
  }
}
