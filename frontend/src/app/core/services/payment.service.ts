import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaymentResponseDto, ProcessPaymentDto } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/payments`;

  // Submit and verify a simulated payment transaction for an existing booking
  processPayment(dto: ProcessPaymentDto): Observable<PaymentResponseDto> {
    return this.http.post<PaymentResponseDto>(this.apiUrl, dto);
  }

  // Find payment status records associated with a specific Booking ID
  getPaymentByBookingId(bookingId: number): Observable<PaymentResponseDto> {
    return this.http.get<PaymentResponseDto>(`${this.apiUrl}/booking/${bookingId}`);
  }
}
