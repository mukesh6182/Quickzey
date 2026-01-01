import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../customer/header/header.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HeaderComponent
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm!: FormGroup;
  isSubmitting = false;

  // Modern Toast Properties
  toastMessage: string | null = null;
  toastType: 'success' | 'danger' = 'success';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: [
        '', 
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[A-Za-z\s]+$/) // only letters and spaces
        ]
      ],
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{10}$/) // exactly 10 digits
        ]
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onRegister() {
  if (this.registerForm.invalid) return;

  this.isSubmitting = true;
  this.toastMessage = null;

  this.authService.register(this.registerForm.value).subscribe({
    next: (res: any) => {
      // Show OTP sent toast
      this.toastMessage = res.message || "OTP sent to your email. Please verify your account.";
      this.toastType = 'success';

      // Navigate to verify OTP page with email in query param
      setTimeout(() => {
        this.isSubmitting = false;
        this.router.navigate(['/register/verify-otp'], {
          queryParams: { email: this.registerForm.value.email }
        });
      }, 1500);
    },
    error: (err) => {
      this.toastMessage = err.error?.message || 'Registration failed.';
      this.toastType = 'danger';
      this.isSubmitting = false;
      setTimeout(() => (this.toastMessage = null), 5000);
    }
  });
}

  registerWithGoogle() {
    this.authService.googleAuth();
  }

  isInvalid(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}