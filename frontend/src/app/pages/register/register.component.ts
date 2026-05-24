import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoaderService } from '../../core/services/loader.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private loaderService = inject(LoaderService);
  private alertService = inject(AlertService);
  private router = inject(Router);

  showPassword = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Reactive Registration Form schema with specific telephone and length rules
  registerForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[+]?[0-9]{8,15}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  // Custom password and confirm-password cross validator
  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  // Toggle password preview character masking state
  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  // Form submission handler
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loaderService.show();
    this.errorMessage.set(null);

    const { fullName, email, phone, password } = this.registerForm.value;
    this.authService.register({ fullName, email, phone, password }).subscribe({
      next: (user) => {
        this.loaderService.hide();
        this.alertService.showAlert(`Account created successfully! Welcome, ${user.fullName}!`, 'success');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loaderService.hide();
        const msg = err.error?.message || err.error || 'Registration failed. Check if email is already in use.';
        this.errorMessage.set(msg);
        this.alertService.showAlert('Registration Failed', 'error');
      }
    });
  }
}
