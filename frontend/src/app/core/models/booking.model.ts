export interface BookingResponseDto {
  id: number;
  bookingReference: string;
  customerId: number;
  customerName: string;
  roomId: number;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  numberOfGuests: number;
  specialRequests?: string;
  totalAmount: number;
  status: string; // Pending, Confirmed, Cancelled, Completed
  bookedAt: string;
  paymentStatus?: string; // Pending, Success, Failed, Refunded
  refundAmount?: number;
  cancellationReason?: string;
}

export interface CreateBookingDto {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
}

export interface CancelBookingDto {
  cancellationReason?: string;
}
