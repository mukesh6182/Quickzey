import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { HeaderComponent } from '../../customer/header/header.component';

@Component({
  selector: 'app-verify-otp-fp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent],
  templateUrl: './verify-otp-fp.component.html',
  styleUrls: ['./verify-otp-fp.component.css']
})
export class VerifyOtpFpComponent implements OnInit {

  otpForm!: FormGroup;
  email!: string;
  toastMessage: string | null = null;
  toastType: 'success' | 'danger' = 'success';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });

    this.route.queryParams.subscribe(p => {
      this.email = p['email'];
      if (!this.email) this.router.navigate(['/forgot-password/reset-password']);
    });
  }

  verifyOtp() {
    this.isSubmitting = true;

    this.authService.verifyForgotOtp({
      email: this.email,
      otp: this.otpForm.value.otp
    }).subscribe({
      next: () => {
        this.router.navigate(['/forgot-password/reset-password'], {
          queryParams: { email: this.email }
        });
      },
      error: err => {
        this.toastType = 'danger';
        this.toastMessage = err.error?.message || 'Invalid OTP';
        this.isSubmitting = false;
      }
    });
  }
}
