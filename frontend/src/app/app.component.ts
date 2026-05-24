import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { AlertComponent } from './shared/components/alert/alert.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, LoaderComponent, AlertComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class App {
  title = 'hotel-booking-frontend';
}
