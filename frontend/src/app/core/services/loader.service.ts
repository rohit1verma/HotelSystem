import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  isLoading = signal<boolean>(false);

  // Trigger loading screen
  show(): void {
    this.isLoading.set(true);
  }

  // Dismiss loading screen
  hide(): void {
    this.isLoading.set(false);
  }
}
