import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // ── Public Access Routes ──────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/search/search.component').then(m => m.SearchComponent)
  },
  {
    path: 'room/:id',
    loadComponent: () => import('./pages/room-detail/room-detail.component').then(m => m.RoomDetailComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },

  // ── Customer Protected Routes (requires Login session) ──────────────────────
  {
    path: 'book/:id',
    loadComponent: () => import('./pages/booking-form/booking-form.component').then(m => m.BookingFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'payment/:bookingId',
    loadComponent: () => import('./pages/payment/payment.component').then(m => m.PaymentComponent),
    canActivate: [authGuard]
  },
  {
    path: 'booking-confirmation',
    loadComponent: () => import('./pages/booking-confirmation/booking-confirmation.component').then(m => m.BookingConfirmationComponent),
    canActivate: [authGuard]
  },
  {
    path: 'my-bookings',
    loadComponent: () => import('./pages/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'booking/:id',
    loadComponent: () => import('./pages/booking-detail/booking-detail.component').then(m => m.BookingDetailComponent),
    canActivate: [authGuard]
  },

  // ── Admin Protected Routes (requires Admin role authorization) ─────────────
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/rooms',
    loadComponent: () => import('./pages/admin/rooms/admin-rooms.component').then(m => m.AdminRoomsComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/bookings',
    loadComponent: () => import('./pages/admin/bookings/admin-bookings.component').then(m => m.AdminBookingsComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/reports',
    loadComponent: () => import('./pages/admin/reports/reports.component').then(m => m.ReportsComponent),
    canActivate: [adminGuard]
  },

  // ── Catch-All Fallback Redirect ──────────────────────────────────────────
  {
    path: '**',
    redirectTo: ''
  }
];
