import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../customer/header/header.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HeaderComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm!: FormGroup;
  isSubmitting = false;

  // Toast messages
  toastMessage: string | null = null;
  toastType: 'success' | 'danger' = 'success';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onLogin() {
    if (this.loginForm.invalid) return;

    this.isSubmitting = true;
    this.toastMessage = null;

    this.authService.login(this.loginForm.value)
      .subscribe({
        next: (res) => {
          this.authService.saveAuthData(res);

          // Show success toast
          this.toastMessage = `Welcome back, ${res.name}!`;
          this.toastType = 'success';
          setTimeout(() => this.toastMessage = null, 3000); // auto dismiss

          // Redirect based on role after short delay
          setTimeout(() => {
            const role = res.role?.toUpperCase();
            switch(role) {
              case 'ADMIN': this.router.navigate(['/admin']); break;
              case 'STORE_MANAGER': this.router.navigate(['/manager/dashboard']); break;
              case 'DELIVERY': this.router.navigate(['/delivery/dashboard']); break;
              case 'CUSTOMER':
              default: this.router.navigate(['/']); break;
            }
          }, 3000);

          this.isSubmitting = false;
        },
        error: (err) => {
          this.toastMessage = err.error?.message || 'Login failed.';
          this.toastType = 'danger';
          setTimeout(() => this.toastMessage = null, 5000); // auto dismiss
          this.isSubmitting = false;
        }
      });
  }

  loginWithGoogle() {
    this.authService.googleAuth();
  }

  isInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

