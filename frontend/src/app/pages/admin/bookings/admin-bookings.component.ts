import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { LoaderService } from '../../../core/services/loader.service';
import { AlertService } from '../../../core/services/alert.service';
import { BookingResponseDto } from '../../../core/models/booking.model';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './admin-bookings.component.html',
  styleUrl: './admin-bookings.component.css'
})
export class AdminBookingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private loaderService = inject(LoaderService);
  private alertService = inject(AlertService);

  bookings = signal<BookingResponseDto[]>([]);
  filteredBookings = signal<BookingResponseDto[]>([]);

  // Search & Filter parameters
  searchQuery = signal<string>('');
  statusFilter = signal<string>('All');

  // Cancellation Modal overlay controls
  showCancelModal = signal<boolean>(false);
  activeBookingId = signal<number | null>(null);
  cancelForm!: FormGroup;

  ngOnInit(): void {
    this.cancelForm = this.fb.group({
      cancellationReason: ['', [Validators.required, Validators.maxLength(300)]]
    });
    this.loadBookings();
  }

  // Load all reservations in the system
  loadBookings(): void {
    this.loaderService.show();
    this.adminService.getAllBookings().subscribe({
      next: (list) => {
        this.loaderService.hide();
        const sorted = list.sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime());
        this.bookings.set(sorted);
        this.applyFilters();
      },
      error: (err) => {
        this.loaderService.hide();
        this.alertService.showAlert('Could not retrieve system bookings.', 'error');
      }
    });
  }

  // Search input handler
  onSearchChange(event: any): void {
    this.searchQuery.set(event.target.value);
    this.applyFilters();
  }

  // Status dropdown filter handler
  onFilterChange(event: any): void {
    this.statusFilter.set(event.target.value);
    this.applyFilters();
  }

  // Reactive filter overlays
  applyFilters(): void {
    let list = this.bookings();

    // Status filter
    if (this.statusFilter() !== 'All') {
      list = list.filter(b => b.status.toLowerCase() === this.statusFilter().toLowerCase());
    }

    // Search query search in reference code or guest name
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      list = list.filter(b =>
        b.bookingReference.toLowerCase().includes(query) ||
        b.customerName.toLowerCase().includes(query)
      );
    }

    this.filteredBookings.set(list);
  }

  // Open cancellation modal
  openCancelModal(bookingId: number): void {
    this.activeBookingId.set(bookingId);
    this.cancelForm.reset({ cancellationReason: '' });
    this.showCancelModal.set(true);
  }

  // Close cancellation modal
  closeCancelModal(): void {
    this.showCancelModal.set(false);
    this.activeBookingId.set(null);
  }

  // Submit admin cancellation reason
  onSubmitCancel(): void {
    if (this.cancelForm.invalid || this.activeBookingId() === null) {
      this.cancelForm.markAllAsTouched();
      return;
    }

    this.loaderService.show();
    this.adminService.adminCancelBooking(this.activeBookingId()!, this.cancelForm.value).subscribe({
      next: () => {
        this.loaderService.hide();
        this.alertService.showAlert('Booking cancelled successfully by Admin.', 'success');
        this.closeCancelModal();
        this.loadBookings();
      },
      error: (err) => {
        this.loaderService.hide();
        const msg = err.error?.message || 'Could not cancel active reservation.';
        this.alertService.showAlert(msg, 'error');
      }
    });
  }

  // Process full transaction refunds
  onRefundPayment(bookingId: number): void {
    if (confirm('Are you sure you want to issue a full refund for this cancelled stay booking?')) {
      this.loaderService.show();
      this.adminService.refundPayment(bookingId).subscribe({
        next: () => {
          this.loaderService.hide();
          this.alertService.showAlert('Refund processed successfully!', 'success');
          this.loadBookings();
        },
        error: (err) => {
          this.loaderService.hide();
          const msg = err.error?.message || 'Failed to process refund.';
          this.alertService.showAlert(msg, 'error');
        }
      });
    }
  }
}
