import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoomService } from '../../core/services/room.service';
import { LoaderService } from '../../core/services/loader.service';
import { AlertService } from '../../core/services/alert.service';
import { AvailableRoomDto } from '../../core/models/room.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roomService = inject(RoomService);
  private loaderService = inject(LoaderService);
  private alertService = inject(AlertService);

  searchForm: FormGroup;
  minDate: string;

  // Signals for state
  rooms = signal<AvailableRoomDto[]>([]);
  filteredRooms = signal<AvailableRoomDto[]>([]);

  // Filter inputs (Signals)
  selectedRoomType = signal<string>('All');
  maxPrice = signal<number>(15000);

  // Helper options list
  roomTypes = ['All', 'Single', 'Double', 'Deluxe', 'Suite', 'Penthouse'];

  constructor() {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    this.searchForm = this.fb.group({
      checkInDate: ['', [Validators.required]],
      checkOutDate: ['', [Validators.required]],
      numberOfGuests: [2, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    // Read route query parameters on startup
    this.route.queryParams.subscribe(params => {
      const checkInDate = params['checkInDate'] || this.minDate;

      const tomorrow = new Date(checkInDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const checkOutDate = params['checkOutDate'] || tomorrow.toISOString().split('T')[0];
      const numberOfGuests = Number(params['numberOfGuests']) || 2;

      this.searchForm.patchValue({
        checkInDate,
        checkOutDate,
        numberOfGuests
      });

      this.executeSearch();
    });
  }

  // Execute room search calling Web API
  executeSearch(): void {
    if (this.searchForm.invalid) {
      this.alertService.showAlert('Please complete all search form parameters.', 'warning');
      return;
    }

    const { checkInDate, checkOutDate, numberOfGuests } = this.searchForm.value;

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      this.alertService.showAlert('Check-out date must succeed check-in date.', 'error');
      return;
    }

    this.loaderService.show();
    this.roomService.searchRooms({
      checkInDate,
      checkOutDate,
      numberOfGuests
    }).subscribe({
      next: (results) => {
        this.loaderService.hide();
        this.rooms.set(results);
        this.applyFilters();
      },
      error: (err) => {
        this.loaderService.hide();
        this.alertService.showAlert('Could not load available accommodations.', 'error');
      }
    });
  }

  // Handle room type selection updates
  onFilterChange(type: string): void {
    this.selectedRoomType.set(type);
    this.applyFilters();
  }

  // Handle maximum night price sliding scale updates
  onPriceChange(event: any): void {
    this.maxPrice.set(Number(event.target.value));
    this.applyFilters();
  }

  // Perform reactive in-memory filter overlays
  private applyFilters(): void {
    let list = this.rooms();

    // Type filter check
    if (this.selectedRoomType() !== 'All') {
      list = list.filter(r => r.roomType.toLowerCase() === this.selectedRoomType().toLowerCase());
    }

    // Price filter check
    list = list.filter(r => r.pricePerNight <= this.maxPrice());

    this.filteredRooms.set(list);
  }

  // Utility to parse comma-separated text into a string array
  splitAmenities(amenities: string): string[] {
    if (!amenities) return [];
    return amenities.split(',').map(a => a.trim());
  }

  // Redirect to individual room catalog, preserving current check dates parameters
  viewDetails(roomId: number): void {
    const { checkInDate, checkOutDate, numberOfGuests } = this.searchForm.value;

    this.router.navigate([`/room/${roomId}`], {
      queryParams: {
        checkInDate,
        checkOutDate,
        numberOfGuests
      }
    });
  }
}
