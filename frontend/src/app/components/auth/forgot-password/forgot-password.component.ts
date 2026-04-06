import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { HeaderComponent } from '../../customer/header/header.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  forgotForm: FormGroup;
  toastMessage: string | null = null;
  toastType: 'success' | 'danger' = 'success';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  isInvalid(name: string) {
    const c = this.forgotForm.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  sendOtp() {
    if (this.forgotForm.invalid) return;

    this.isSubmitting = true;

    this.authService.forgotPassword(this.forgotForm.value).subscribe({
      next: (res: any) => {
        this.toastType = 'success';
        this.toastMessage = res.message;

        setTimeout(() => {
          this.router.navigate(['/forgot-password/verify-otp'], {
            queryParams: { email: this.forgotForm.value.email }
          });
        }, 1500);
      },
      error: err => {
        this.toastType = 'danger';
        this.toastMessage = err.error?.message || 'Failed to send OTP';
        this.isSubmitting = false;
      }
    });
  }
}
