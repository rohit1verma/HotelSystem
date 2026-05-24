import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoaderService } from '../../core/services/loader.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private loaderService = inject(LoaderService);
  private alertService = inject(AlertService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Reactive Login Form schema
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  showPassword = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Toggle password field input type between password and text
  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  // Handle credentials form submissions
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loaderService.show();
    this.errorMessage.set(null);

    this.authService.login(this.loginForm.value).subscribe({
      next: (user) => {
        this.loaderService.hide();
        this.alertService.showAlert(`Welcome back, ${user.fullName}!`, 'success');

        // Check if there is an auth guard returnUrl query parameter
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loaderService.hide();
        const msg = err.error?.message || err.error || 'Authentication failed. Please verify credentials.';
        this.errorMessage.set(msg);
        this.alertService.showAlert('Login Failed', 'error');
      }
    });
  }
}
