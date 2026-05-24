import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoomResponseDto, CreateRoomDto, UpdateRoomDto } from '../models/room.model';
import { BookingResponseDto, CancelBookingDto } from '../models/booking.model';
import { CustomerResponseDto } from '../models/auth.model';
import { PaymentResponseDto } from '../models/payment.model';
import { BookingSummaryReport } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin`;

  // ── Room Inventory CRUD operations ────────────────────────────────────────

  createRoom(dto: CreateRoomDto): Observable<RoomResponseDto> {
    return this.http.post<RoomResponseDto>(`${this.apiUrl}/rooms`, dto);
  }

  getRoomById(id: number): Observable<RoomResponseDto> {
    return this.http.get<RoomResponseDto>(`${this.apiUrl}/rooms/${id}`);
  }

  getAllRooms(): Observable<RoomResponseDto[]> {
    return this.http.get<RoomResponseDto[]>(`${this.apiUrl}/rooms`);
  }

  updateRoom(id: number, dto: UpdateRoomDto): Observable<RoomResponseDto> {
    return this.http.put<RoomResponseDto>(`${this.apiUrl}/rooms/${id}`, dto);
  }

  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/rooms/${id}`);
  }

  // ── Bookings Oversight operations ─────────────────────────────────────────

  getAllBookings(): Observable<BookingResponseDto[]> {
    return this.http.get<BookingResponseDto[]>(`${this.apiUrl}/bookings`);
  }

  adminCancelBooking(id: number, dto: CancelBookingDto): Observable<BookingResponseDto> {
    return this.http.post<BookingResponseDto>(`${this.apiUrl}/bookings/${id}/cancel`, dto);
  }

  expirePendingBookings(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/bookings/expire-pending`, {});
  }

  // ── Customer Database Oversight operations ─────────────────────────────────

  getAllCustomers(): Observable<CustomerResponseDto[]> {
    return this.http.get<CustomerResponseDto[]>(`${this.apiUrl}/customers`);
  }

  // ── Financial refund oversight operations ──────────────────────────────────

  refundPayment(bookingId: number): Observable<PaymentResponseDto> {
    return this.http.post<PaymentResponseDto>(`${this.apiUrl}/payments/booking/${bookingId}/refund`, {});
  }

  // ── Analytics & Occupancy Reports ──────────────────────────────────────────

  getSummaryReport(from?: string, to?: string): Observable<BookingSummaryReport> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return this.http.get<BookingSummaryReport>(`${this.apiUrl}/reports/summary`, { params });
  }
}
