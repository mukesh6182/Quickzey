import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
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
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  isSubmitting = false;

  // Toast messages
  toastMessage: string | null = null;
  toastType: 'success' | 'danger' = 'success';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // ✅ HANDLE GOOGLE LOGIN ERRORS HERE
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const error = params['error'];

      if (error === 'manual_account') {
        this.toastMessage =
          'This email is registered manually. Please login using email and password.';
        this.toastType = 'danger';

        // Auto dismiss toast
        setTimeout(() => this.toastMessage = null, 5000);

        // Optional: clean URL
        this.router.navigate([], {
          queryParams: {},
          replaceUrl: true
        });
      }
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

          this.toastMessage = `Welcome back, ${res.name}!`;
          this.toastType = 'success';
          setTimeout(() => this.toastMessage = null, 3000);

          setTimeout(() => {
            const role = res.role?.toUpperCase();
            switch (role) {
              case 'ADMIN': this.router.navigate(['/admin']); break;
              case 'STORE_MANAGER': this.router.navigate(['/manager/dashboard']); break;
              case 'DELIVERY': this.router.navigate(['/delivery/dashboard']); break;
              default: this.router.navigate(['/']); break;
            }
          }, 3000);

          this.isSubmitting = false;
        },
        error: (err) => {
          this.toastMessage = err.error?.message || 'Login failed.';
          this.toastType = 'danger';
          setTimeout(() => this.toastMessage = null, 5000);
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
