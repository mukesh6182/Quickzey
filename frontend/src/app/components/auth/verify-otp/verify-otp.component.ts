import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { HeaderComponent } from '../../customer/header/header.component';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent],
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.css']
})
export class VerifyOtpComponent implements OnInit {
  otpForm!: FormGroup;
  email!: string;
  toastMessage: string | null = null;
  toastType: 'success' | 'danger' = 'success';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern(/^[0-9]{6}$/)]]
    });

    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      if (!this.email) {
        this.router.navigate(['/register']);
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.otpForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  verifyOtp() {
    if (this.otpForm.invalid) return;

    this.isSubmitting = true;
    this.authService.verifyOtp({ email: this.email, otp: this.otpForm.value.otp })
      .subscribe({
        next: (res: any) => {
          this.toastMessage = res.message || 'OTP verified successfully!';
          this.toastType = 'success';
          
          // Save token, role, name like login
          this.authService.saveAuthData(res);

          setTimeout(() => this.router.navigate(['/']), 1500);
        },
        error: (err: any) => {
          this.toastMessage = err.error?.message || 'Invalid OTP. Please try again.';
          this.toastType = 'danger';
          this.isSubmitting = false;
          setTimeout(() => this.toastMessage = null, 5000);
        }
      });
  }
}
