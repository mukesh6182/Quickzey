import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { HeaderComponent } from '../../customer/header/header.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  form!: FormGroup;
  email!: string;

  // Toast properties
  toastMessage: string | null = null;
  toastType: 'success' | 'danger' = 'success';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.email = this.route.snapshot.queryParams['email'];
    if (!this.email) this.router.navigate(['/login']);

    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) return;

    if (this.form.value.newPassword !== this.form.value.confirmPassword) {
      this.toastType = 'danger';
      this.toastMessage = 'Passwords do not match.';
      return;
    }

    this.isSubmitting = true;
    this.toastMessage = null;

    this.authService.resetPassword({
      email: this.email,
      newPassword: this.form.value.newPassword,
      confirmPassword: this.form.value.confirmPassword
    }).subscribe({
      next: (res: any) => {
        this.toastType = 'success';
        this.toastMessage = res.message || 'Password reset successful!';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err: any) => {
        this.toastType = 'danger';
        this.toastMessage = err.error?.message || 'Something went wrong!';
        this.isSubmitting = false;

        setTimeout(() => (this.toastMessage = null), 5000);
      }
    });
  }
}
