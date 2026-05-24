import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './booking-confirmation.component.html',
  styleUrl: './booking-confirmation.component.css'
})
export class BookingConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);

  bookingReference = signal<string>('');

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.bookingReference.set(params['reference'] || 'HB-UNKNOWN');
    });
  }
}
