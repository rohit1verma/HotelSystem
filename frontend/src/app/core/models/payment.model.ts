export interface PaymentResponseDto {
  id: number;
  bookingId: number;
  bookingReference: string;
  amount: number;
  paymentMethod: string; // CreditCard, DebitCard, UPI, NetBanking
  status: string; // Pending, Success, Failed, Refunded
  transactionId?: string;
  createdAt: string;
  processedAt?: string;
  refundAmount?: number;
}

export interface ProcessPaymentDto {
  bookingId: number;
  paymentMethod: string;
  paymentToken: string; // simulated card token
}
