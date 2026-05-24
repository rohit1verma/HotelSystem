import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { LoaderService } from '../../../core/services/loader.service';
import { AlertService } from '../../../core/services/alert.service';
import { RoomResponseDto } from '../../../core/models/room.model';

@Component({
  selector: 'app-admin-rooms',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-rooms.component.html',
  styleUrl: './admin-rooms.component.css'
})
export class AdminRoomsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private loaderService = inject(LoaderService);
  private alertService = inject(AlertService);

  rooms = signal<RoomResponseDto[]>([]);
  showDrawer = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  editingRoomId = signal<number | null>(null);

  roomForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadRooms();
  }

  // Initialize the Room form structure
  initForm(): void {
    this.roomForm = this.fb.group({
      roomNumber: ['', [Validators.required, Validators.maxLength(10)]],
      roomType: ['Deluxe', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(500)]],
      pricePerNight: [1000, [Validators.required, Validators.min(1), Validators.max(100000)]],
      maxGuests: [2, [Validators.required, Validators.min(1), Validators.max(20)]],
      amenities: ['', [Validators.required]],
      imageUrl: [''],
      isActive: [true]
    });
  }

  // Fetch full inventory of rooms
  loadRooms(): void {
    this.loaderService.show();
    this.adminService.getAllRooms().subscribe({
      next: (list) => {
        this.loaderService.hide();
        this.rooms.set(list);
      },
      error: (err) => {
        this.loaderService.hide();
        this.alertService.showAlert('Could not fetch room catalog.', 'error');
      }
    });
  }

  // Open drawer in addition mode
  openAddDrawer(): void {
    this.isEditMode.set(false);
    this.editingRoomId.set(null);
    this.roomForm.reset({
      roomNumber: '',
      roomType: 'Deluxe',
      description: '',
      pricePerNight: 1000,
      maxGuests: 2,
      amenities: 'Mini Bar, Free WiFi, Air Conditioning, Smart TV',
      imageUrl: '',
      isActive: true
    });
    this.roomForm.get('roomNumber')?.enable(); // Let edit room number for new suites
    this.showDrawer.set(true);
  }

  // Open drawer in specifications modifications mode
  openEditDrawer(room: RoomResponseDto): void {
    this.isEditMode.set(true);
    this.editingRoomId.set(room.id);
    this.roomForm.patchValue({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      description: room.description,
      pricePerNight: room.pricePerNight,
      maxGuests: room.maxGuests,
      amenities: room.amenities,
      imageUrl: room.imageUrl,
      isActive: room.isActive
    });
    this.roomForm.get('roomNumber')?.disable(); // Lock room number edit to preserve schema integrity
    this.showDrawer.set(true);
  }

  // Close form drawer
  closeDrawer(): void {
    this.showDrawer.set(false);
  }

  // Submit CRUD transaction
  onSubmit(): void {
    if (this.roomForm.invalid) {
      this.roomForm.markAllAsTouched();
      return;
    }

    this.loaderService.show();

    // Read form values including disabled inputs
    const formRaw = this.roomForm.getRawValue();

    if (this.isEditMode() && this.editingRoomId() !== null) {
      // Modify Room specs
      this.adminService.updateRoom(this.editingRoomId()!, formRaw).subscribe({
        next: () => {
          this.loaderService.hide();
          this.alertService.showAlert('Room updated successfully.', 'success');
          this.closeDrawer();
          this.loadRooms();
        },
        error: (err) => {
          this.loaderService.hide();
          const msg = err.error?.message || err.error || 'Could not update room catalog specs.';
          this.alertService.showAlert(msg, 'error');
        }
      });
    } else {
      // Create new Room
      this.adminService.createRoom(formRaw).subscribe({
        next: () => {
          this.loaderService.hide();
          this.alertService.showAlert('Room created successfully.', 'success');
          this.closeDrawer();
          this.loadRooms();
        },
        error: (err) => {
          this.loaderService.hide();
          const msg = err.error?.message || err.error || 'Could not add new room.';
          this.alertService.showAlert(msg, 'error');
        }
      });
    }
  }

  // Delete suite from database catalog
  onDeleteRoom(id: number): void {
    if (confirm('Are you absolutely sure you want to delete this room? This action is permanent and cannot be undone.')) {
      this.loaderService.show();
      this.adminService.deleteRoom(id).subscribe({
        next: () => {
          this.loaderService.hide();
          this.alertService.showAlert('Room deleted successfully.', 'success');
          this.loadRooms();
        },
        error: (err) => {
          this.loaderService.hide();
          const msg = err.error?.message || err.error || 'Failed to remove room. Verify if it has active bookings.';
          this.alertService.showAlert(msg, 'error');
        }
      });
    }
  }
}
