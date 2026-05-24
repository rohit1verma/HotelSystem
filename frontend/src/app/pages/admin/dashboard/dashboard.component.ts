import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { LoaderService } from '../../../core/services/loader.service';
import { AlertService } from '../../../core/services/alert.service';
import { BookingSummaryReport } from '../../../core/models/report.model';
import { CustomerResponseDto } from '../../../core/models/auth.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private loaderService = inject(LoaderService);
  private alertService = inject(AlertService);

  report = signal<BookingSummaryReport | null>(null);
  customers = signal<CustomerResponseDto[]>([]);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  // Load report data and registered customers list concurrently
  loadDashboardData(): void {
    this.loaderService.show();

    // Query overall business summaries
    this.adminService.getSummaryReport().subscribe({
      next: (summary) => {
        this.report.set(summary);

        // Fetch customer list profiles
        this.adminService.getAllCustomers().subscribe({
          next: (users) => {
            this.loaderService.hide();
            this.customers.set(users);
          },
          error: () => {
            this.loaderService.hide();
            this.alertService.showAlert('Could not load customers profile database.', 'error');
          }
        });
      },
      error: (err) => {
        this.loaderService.hide();
        this.alertService.showAlert('Could not load business reports summary.', 'error');
      }
    });
  }

  // Execute quick clean action to invalidate stale unpaid reservations
  onExpirePendingBookings(): void {
    if (confirm('Are you sure you want to expire all unpaid pending bookings that have crossed their limits?')) {
      this.loaderService.show();
      this.adminService.expirePendingBookings().subscribe({
        next: (res) => {
          this.loaderService.hide();
          this.alertService.showAlert(res.message, 'success');
          this.loadDashboardData(); // Refresh summary metrics
        },
        error: (err) => {
          this.loaderService.hide();
          this.alertService.showAlert('Failed to expire pending bookings.', 'error');
        }
      });
    }
  }
}
