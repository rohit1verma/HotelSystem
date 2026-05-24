export interface CustomerResponseDto {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export interface RegisterCustomerDto {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
}

export interface LoginDto {
  email: string;
  password?: string;
}

export interface AuthResponseDto {
  token: string;
  fullName: string;
  email: string;
  role: string;
  expiresAt: string;
}
