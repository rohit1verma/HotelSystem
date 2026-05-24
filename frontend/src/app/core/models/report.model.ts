export interface RoomOccupancyReport {
  roomNumber: string;
  roomType: string;
  bookingCount: number;
  revenue: number;
  occupancyRate: number;
}

export interface BookingSummaryReport {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  refundedAmount: number;
  roomOccupancy: RoomOccupancyReport[];
}
