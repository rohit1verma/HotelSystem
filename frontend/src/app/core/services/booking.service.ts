import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BookingResponseDto, CreateBookingDto, CancelBookingDto } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/bookings`;

  // Place a new room reservation booking
  createBooking(dto: CreateBookingDto): Observable<BookingResponseDto> {
    return this.http.post<BookingResponseDto>(this.apiUrl, dto);
  }

  // Fetch full details of a specific booking by ID
  getBookingById(id: number): Observable<BookingResponseDto> {
    return this.http.get<BookingResponseDto>(`${this.apiUrl}/${id}`);
  }

  // Fetch details of a specific booking by its alphanumeric reference
  getBookingByReference(reference: string): Observable<BookingResponseDto> {
    return this.http.get<BookingResponseDto>(`${this.apiUrl}/reference/${reference}`);
  }

  // Fetch booking history lists for the currently authenticated customer
  getMyBookings(): Observable<BookingResponseDto[]> {
    return this.http.get<BookingResponseDto[]>(`${this.apiUrl}/my`);
  }

  // Request a cancellation of a customer booking
  cancelBooking(id: number, dto: CancelBookingDto): Observable<BookingResponseDto> {
    return this.http.post<BookingResponseDto>(`${this.apiUrl}/${id}/cancel`, dto);
  }
}
