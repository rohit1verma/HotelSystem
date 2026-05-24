import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponseDto, LoginDto, RegisterCustomerDto } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/customers`;

  // Signals for auth state
  currentUser = signal<AuthResponseDto | null>(null);
  
  // Computed values derived from the currentUser signal
  isAuthenticated = computed(() => this.currentUser() !== null);
  isAdmin = computed(() => this.currentUser()?.role === 'Admin');

  constructor() {
    this.loadUserFromStorage();
  }

  // Registers a new customer and automatically logs them in (saves token)
  register(dto: RegisterCustomerDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.apiUrl}/register`, dto).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  // Logs in a customer or admin
  login(dto: LoginDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.apiUrl}/login`, dto).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  // Logs out the user and clears all credentials
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_expires_at');
    this.currentUser.set(null);
  }

  // Helper method to sync credentials to local storage and update state
  private handleAuthSuccess(response: AuthResponseDto): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user_role', response.role);
    localStorage.setItem('user_name', response.fullName);
    localStorage.setItem('user_email', response.email);
    localStorage.setItem('user_expires_at', response.expiresAt);
    
    this.currentUser.set(response);
  }

  // Checks localStorage and initializes the auth signal on startup
  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('user_role');
    const fullName = localStorage.getItem('user_name');
    const email = localStorage.getItem('user_email');
    const expiresAt = localStorage.getItem('user_expires_at');

    if (token && role && fullName && email && expiresAt) {
      // Validate expiration
      const expirationDate = new Date(expiresAt);
      if (expirationDate > new Date()) {
        this.currentUser.set({
          token,
          role,
          fullName,
          email,
          expiresAt
        });
      } else {
        this.logout();
      }
    }
  }
}
