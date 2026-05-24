import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private alertService = inject(AlertService);

  searchForm: FormGroup;
  minDate: string;

  constructor() {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Initialize quick search parameters with sensible defaults (today to tomorrow, 2 guests)
    this.searchForm = this.fb.group({
      checkInDate: [this.minDate, [Validators.required]],
      checkOutDate: [tomorrowStr, [Validators.required]],
      numberOfGuests: [2, [Validators.required, Validators.min(1), Validators.max(20)]]
    });
  }

  // Handle date search queries
  onSubmit(): void {
    if (this.searchForm.invalid) {
      this.alertService.showAlert('Please complete search criteria accurately.', 'warning');
      return;
    }

    const { checkInDate, checkOutDate, numberOfGuests } = this.searchForm.value;

    // Verify chronological order of check-in and check-out dates
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      this.alertService.showAlert('Check-out date must succeed check-in date.', 'error');
      return;
    }

    // Redirect to the main search catalog with active parameters
    this.router.navigate(['/search'], {
      queryParams: {
        checkInDate,
        checkOutDate,
        numberOfGuests
      }
    });
  }
}
