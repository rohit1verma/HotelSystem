import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { PaymentService } from '../../core/services/payment.service';
import { LoaderService } from '../../core/services/loader.service';
import { AlertService } from '../../core/services/alert.service';
import { CommonModule, DatePipe } from '@angular/common';
import { BookingResponseDto } from '../../core/models/booking.model';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);
  private paymentService = inject(PaymentService);
  private loaderService = inject(LoaderService);
  private alertService = inject(AlertService);

  paymentForm!: FormGroup;
  booking = signal<BookingResponseDto | null>(null);

  // Dynamic interactive credit card preview signals
  selectedMethod = signal<string>('CreditCard');
  isFlipped = signal<boolean>(false);
  cardNumberFormatted = signal<string>('•••• •••• •••• ••••');
  cardHolderFormatted = signal<string>('CARDHOLDER NAME');
  cardExpiryFormatted = signal<string>('MM/YY');
  cardCvcFormatted = signal<string>('•••');

  ngOnInit(): void {
    const bookingId = Number(this.route.snapshot.paramMap.get('bookingId'));

    this.paymentForm = this.fb.group({
      bookingId: [bookingId, [Validators.required]],
      paymentMethod: ['CreditCard', [Validators.required]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      cardHolder: ['', [Validators.required, Validators.maxLength(100)]],
      expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvc: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]]
    });

    this.loadBookingDetails(bookingId);

    // Watchers for visual card synchronization
    this.paymentForm.get('cardNumber')?.valueChanges.subscribe(val => {
      if (!val) {
        this.cardNumberFormatted.set('•••• •••• •••• ••••');
        return;
      }
      const cleaned = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const matches = cleaned.match(/\d{4,16}/g);
      const match = (matches && matches[0]) || '';
      const parts = [];

      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }

      this.cardNumberFormatted.set(parts.length > 0 ? parts.join(' ') : val);
    });

    this.paymentForm.get('cardHolder')?.valueChanges.subscribe(val => {
      this.cardHolderFormatted.set(val ? val.toUpperCase() : 'CARDHOLDER NAME');
    });

    this.paymentForm.get('expiry')?.valueChanges.subscribe(val => {
      this.cardExpiryFormatted.set(val || 'MM/YY');
    });

    this.paymentForm.get('cvc')?.valueChanges.subscribe(val => {
      this.cardCvcFormatted.set(val || '•••');
    });
  }

  // Load target pending reservation details
  loadBookingDetails(id: number): void {
    this.loaderService.show();
    this.bookingService.getBookingById(id).subscribe({
      next: (data) => {
        this.loaderService.hide();
        this.booking.set(data);

        // Terminate checkout immediately if booking has been cancelled or completed
        if (data.status !== 'Pending') {
          this.alertService.showAlert(`Booking status is currently ${data.status}.`, 'warning');
          this.router.navigate(['/my-bookings']);
        }
      },
      error: (err) => {
        this.loaderService.hide();
        this.alertService.showAlert('Could not fetch booking details.', 'error');
        this.router.navigate(['/my-bookings']);
      }
    });
  }

  // Switch payment gateway formats (CreditCard, NetBanking, UPI)
  setPaymentMethod(method: string): void {
    this.selectedMethod.set(method);
    this.paymentForm.get('paymentMethod')?.setValue(method);
    this.isFlipped.set(false);

    // Toggle validation rules on-the-fly
    const controls = ['cardNumber', 'cardHolder', 'expiry', 'cvc'];
    if (method === 'CreditCard') {
      this.paymentForm.get('cardNumber')?.setValidators([Validators.required, Validators.pattern(/^\d{16}$/)]);
      this.paymentForm.get('cardHolder')?.setValidators([Validators.required, Validators.maxLength(100)]);
      this.paymentForm.get('expiry')?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]);
      this.paymentForm.get('cvc')?.setValidators([Validators.required, Validators.pattern(/^\d{3}$/)]);
    } else {
      controls.forEach(c => this.paymentForm.get(c)?.clearValidators());
    }
    controls.forEach(c => this.paymentForm.get(c)?.updateValueAndValidity());
  }

  // Flip credit card 3D model to reveal CVC back code
  onFocusCvc(): void {
    if (this.selectedMethod() === 'CreditCard') {
      this.isFlipped.set(true);
    }
  }

  // Restore credit card front view
  onBlurCvc(): void {
    this.isFlipped.set(false);
  }

  // Submit and process checkout payment transaction
  onSubmit(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const { bookingId, paymentMethod } = this.paymentForm.value;
    const paymentToken = 'tok_' + Math.random().toString(36).substring(2, 10).toUpperCase();

    this.loaderService.show();
    this.paymentService.processPayment({
      bookingId,
      paymentMethod,
      paymentToken
    }).subscribe({
      next: (payment) => {
        this.loaderService.hide();
        this.alertService.showAlert('Payment processed successfully!', 'success');

        const bookingRef = this.booking()?.bookingReference || '';
        this.router.navigate(['/booking-confirmation'], {
          queryParams: { reference: bookingRef }
        });
      },
      error: (err) => {
        this.loaderService.hide();
        const msg = err.error?.message || err.error || 'Transaction refused. Verify credentials.';
        this.alertService.showAlert(msg, 'error');
      }
    });
  }
}
