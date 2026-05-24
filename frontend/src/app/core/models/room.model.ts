export interface RoomResponseDto {
  id: number;
  roomNumber: string;
  roomType: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  amenities: string;
  imageUrl: string;
  isActive: boolean;
}

export interface CreateRoomDto {
  roomNumber: string;
  roomType: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  amenities: string;
  imageUrl: string;
}

export interface UpdateRoomDto {
  roomType?: string;
  description?: string;
  pricePerNight?: number;
  maxGuests?: number;
  amenities?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface RoomSearchDto {
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  roomType?: string;
  maxPricePerNight?: number;
}

export interface AvailableRoomDto {
  roomId: number;
  roomNumber: string;
  roomType: string;
  description: string;
  pricePerNight: number;
  totalPrice: number;
  numberOfNights: number;
  maxGuests: number;
  amenities: string;
  imageUrl: string;
}
