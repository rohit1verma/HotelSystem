import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoomService } from '../../core/services/room.service';
import { AuthService } from '../../core/services/auth.service';
import { LoaderService } from '../../core/services/loader.service';
import { AlertService } from '../../core/services/alert.service';
import { RoomResponseDto } from '../../core/models/room.model';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './room-detail.component.html',
  styleUrl: './room-detail.component.css'
})
export class RoomDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roomService = inject(RoomService);
  private authService = inject(AuthService);
  private loaderService = inject(LoaderService);
  private alertService = inject(AlertService);

  room = signal<RoomResponseDto | null>(null);

  // Search parameters preserved from the search catalog
  checkInDate = signal<string | null>(null);
  checkOutDate = signal<string | null>(null);
  numberOfGuests = signal<number | null>(null);

  // Dynamic stay pricing computations
  numberOfNights = signal<number>(0);
  totalPrice = signal<number>(0);

  ngOnInit(): void {
    const roomId = Number(this.route.snapshot.paramMap.get('id'));

    // Read route query parameters preserved from searches
    this.route.queryParams.subscribe(params => {
      this.checkInDate.set(params['checkInDate'] || null);
      this.checkOutDate.set(params['checkOutDate'] || null);
      this.numberOfGuests.set(Number(params['numberOfGuests']) || null);

      this.loadRoomDetails(roomId);
    });
  }

  // Load full details for the specified room ID
  loadRoomDetails(id: number): void {
    this.loaderService.show();
    this.roomService.getRoomById(id).subscribe({
      next: (data) => {
        this.loaderService.hide();
        this.room.set(data);
        this.calculateTotals();
      },
      error: (err) => {
        this.loaderService.hide();
        this.alertService.showAlert('Could not load room specifications.', 'error');
        this.router.navigate(['/search']);
      }
    });
  }

  // In-memory calculations of nights count and stay totals
  calculateTotals(): void {
    const room = this.room();
    const inDate = this.checkInDate();
    const outDate = this.checkOutDate();

    if (room && inDate && outDate) {
      const start = new Date(inDate);
      const end = new Date(outDate);

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      this.numberOfNights.set(diffDays > 0 ? diffDays : 1);
      this.totalPrice.set(this.numberOfNights() * room.pricePerNight);
    }
  }

  // Convert comma string into string list
  splitAmenities(amenities: string): string[] {
    if (!amenities) return [];
    return amenities.split(',').map(a => a.trim());
  }

  // Book now click action
  onBookNow(): void {
    const room = this.room();
    if (!room) return;

    // Check user authentication
    if (!this.authService.isAuthenticated()) {
      this.alertService.showAlert('Login required to reserve a suite.', 'info');

      // Preserve full routing parameter for redirect return
      const returnUrl = `/room/${room.id}`;
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl,
          checkInDate: this.checkInDate(),
          checkOutDate: this.checkOutDate(),
          numberOfGuests: this.numberOfGuests()
        }
      });
      return;
    }

    // Direct redirection to the reactive reservation form
    this.router.navigate([`/book/${room.id}`], {
      queryParams: {
        checkInDate: this.checkInDate(),
        checkOutDate: this.checkOutDate(),
        numberOfGuests: this.numberOfGuests()
      }
    });
  }
}
