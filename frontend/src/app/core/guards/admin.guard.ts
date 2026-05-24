import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('user_role');

  if (token && role === 'Admin') {
    return true;
  }

  // If unauthorized, redirect to home page
  router.navigate(['/']);
  return false;
};
