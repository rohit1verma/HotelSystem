import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoomService } from '../../core/services/room.service';
import { BookingService } from '../../core/services/booking.service';
import { LoaderService } from '../../core/services/loader.service';
import { AlertService } from '../../core/services/alert.service';
import { RoomResponseDto } from '../../core/models/room.model';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.css'
})
export class BookingFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roomService = inject(RoomService);
  private bookingService = inject(BookingService);
  private loaderService = inject(LoaderService);
  private alertService = inject(AlertService);

  bookingForm!: FormGroup;
  room = signal<RoomResponseDto | null>(null);

  // Dynamic stay calculations
  numberOfNights = signal<number>(0);
  totalPrice = signal<number>(0);

  ngOnInit(): void {
    const roomId = Number(this.route.snapshot.paramMap.get('id'));

    // Pre-fill fields utilizing preservation parameters
    const checkInDate = this.route.snapshot.queryParams['checkInDate'] || '';
    const checkOutDate = this.route.snapshot.queryParams['checkOutDate'] || '';
    const numberOfGuests = Number(this.route.snapshot.queryParams['numberOfGuests']) || 2;

    this.bookingForm = this.fb.group({
      roomId: [roomId, [Validators.required]],
      checkInDate: [checkInDate, [Validators.required]],
      checkOutDate: [checkOutDate, [Validators.required]],
      numberOfGuests: [numberOfGuests, [Validators.required, Validators.min(1)]],
      specialRequests: ['', [Validators.maxLength(500)]]
    });

    this.loadRoomDetails(roomId);

    // Watch dates fields dynamically to calculate stay details
    this.bookingForm.valueChanges.subscribe(() => {
      this.calculateTotals();
    });
  }

  // Load specific room details to configure validation parameters
  loadRoomDetails(id: number): void {
    this.loaderService.show();
    this.roomService.getRoomById(id).subscribe({
      next: (data) => {
        this.loaderService.hide();
        this.room.set(data);

        // Dynamically add validation capacity boundaries based on active Room info
        this.bookingForm.get('numberOfGuests')?.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(data.maxGuests)
        ]);
        this.bookingForm.get('numberOfGuests')?.updateValueAndValidity();

        this.calculateTotals();
      },
      error: (err) => {
        this.loaderService.hide();
        this.alertService.showAlert('Could not load room parameters.', 'error');
        this.router.navigate(['/search']);
      }
    });
  }

  // In-memory calculations of days count and stay costs
  calculateTotals(): void {
    const room = this.room();
    const { checkInDate, checkOutDate } = this.bookingForm.value;

    if (room && checkInDate && checkOutDate) {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);

      if (end > start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        this.numberOfNights.set(diffDays);
        this.totalPrice.set(diffDays * room.pricePerNight);
      } else {
        this.numberOfNights.set(0);
        this.totalPrice.set(0);
      }
    }
  }

  // Form submission dispatcher
  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const { checkInDate, checkOutDate } = this.bookingForm.value;
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      this.alertService.showAlert('Check-out date must succeed check-in date.', 'error');
      return;
    }

    this.loaderService.show();
    this.bookingService.createBooking(this.bookingForm.value).subscribe({
      next: (booking) => {
        this.loaderService.hide();
        this.alertService.showAlert('Reservation created! Please complete payment.', 'success');
        this.router.navigate([`/payment/${booking.id}`]);
      },
      error: (err) => {
        this.loaderService.hide();
        const msg = err.error?.message || err.error || 'Suite occupies during dates selected.';
        this.alertService.showAlert(msg, 'error');
      }
    });
  }
}
