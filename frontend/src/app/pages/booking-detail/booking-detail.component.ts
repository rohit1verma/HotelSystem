import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { BookingService } from '../../core/services/booking.service';
import { LoaderService } from '../../core/services/loader.service';
import { AlertService } from '../../core/services/alert.service';
import { BookingResponseDto } from '../../core/models/booking.model';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './booking-detail.component.html',
  styleUrl: './booking-detail.component.css'
})
export class BookingDetailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);
  private loaderService = inject(LoaderService);
  private alertService = inject(AlertService);

  booking = signal<BookingResponseDto | null>(null);
  cancelForm!: FormGroup;

  ngOnInit(): void {
    const bookingId = Number(this.route.snapshot.paramMap.get('id'));

    this.cancelForm = this.fb.group({
      cancellationReason: ['', [Validators.required, Validators.maxLength(300)]]
    });

    this.loadBookingDetails(bookingId);
  }

  // Load complete details for the active booking log
  loadBookingDetails(id: number): void {
    this.loaderService.show();
    this.bookingService.getBookingById(id).subscribe({
      next: (data) => {
        this.loaderService.hide();
        this.booking.set(data);
      },
      error: (err) => {
        this.loaderService.hide();
        this.alertService.showAlert('Could not load specific booking information.', 'error');
        this.router.navigate(['/my-bookings']);
      }
    });
  }

  // Process customer reservation cancellation request
  onCancelBooking(): void {
    if (this.cancelForm.invalid) {
      this.cancelForm.markAllAsTouched();
      return;
    }

    const bookingData = this.booking();
    if (!bookingData) return;

    if (confirm('Are you absolutely sure you want to cancel this booking? This request is irreversible.')) {
      this.loaderService.show();
      this.bookingService.cancelBooking(bookingData.id, this.cancelForm.value).subscribe({
        next: (updated) => {
          this.loaderService.hide();
          this.alertService.showAlert('Booking cancelled successfully.', 'success');
          this.booking.set(updated);
          this.cancelForm.reset();
        },
        error: (err) => {
          this.loaderService.hide();
          const msg = err.error?.message || err.error || 'Cancellation request refused.';
          this.alertService.showAlert(msg, 'error');
        }
      });
    }
  }
}
