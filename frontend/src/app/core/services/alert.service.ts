import { Injectable, signal } from '@angular/core';

export interface AlertMessage {
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  alert = signal<AlertMessage | null>(null);

  // Triggers a visual alert message
  showAlert(message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info'): void {
    this.alert.set({ message, type });

    // Auto-dismiss the alert after 4 seconds
    setTimeout(() => {
      this.clear();
    }, 4000);
  }

  // Clear current active alert
  clear(): void {
    this.alert.set(null);
  }
}
