import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { LoaderService } from '../../../core/services/loader.service';
import { AlertService } from '../../../core/services/alert.service';
import { BookingSummaryReport } from '../../../core/models/report.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private loaderService = inject(LoaderService);
  private alertService = inject(AlertService);

  reportForm!: FormGroup;
  report = signal<BookingSummaryReport | null>(null);

  ngOnInit(): void {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Configure sensible year-round default filters
    const defaultFrom = `${currentYear}-01-01`;
    const defaultTo = `${currentYear}-12-31`;

    this.reportForm = this.fb.group({
      from: [defaultFrom, [Validators.required]],
      to: [defaultTo, [Validators.required]]
    });

    this.loadReport();
  }

  // Load occupancy analytics report from Web API using date filters
  loadReport(): void {
    if (this.reportForm.invalid) {
      this.alertService.showAlert('Please fill in valid report dates.', 'warning');
      return;
    }

    const { from, to } = this.reportForm.value;

    if (new Date(to) < new Date(from)) {
      this.alertService.showAlert('The "To" date must succeed the "From" date.', 'error');
      return;
    }

    this.loaderService.show();
    this.adminService.getSummaryReport(from, to).subscribe({
      next: (summary) => {
        this.loaderService.hide();
        this.report.set(summary);
      },
      error: (err) => {
        this.loaderService.hide();
        this.alertService.showAlert('Could not query occupancy reports.', 'error');
      }
    });
  }

  // Class mapping utility to color code occupancy rates
  getOccupancyRateClass(rate: number): string {
    const percentage = rate * 100;
    if (percentage >= 70) return 'high-occupancy';
    if (percentage >= 30) return 'mid-occupancy';
    return 'low-occupancy';
  }
}
