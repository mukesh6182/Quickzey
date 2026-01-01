import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:4000/auth';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // LOGIN
  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }

  // REGISTER
  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }
    // auth.service.ts
  verifyOtp(data: { email: string, otp: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register/verify-otp`, data);
  }


  // GOOGLE AUTH
  googleAuth() {
    window.location.href = `${this.baseUrl}/google`;
  }

  // SAVE USER DATA
  saveAuthData(res: any) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('userName', res.name || 'Guest');
    localStorage.setItem('role', res.role || 'CUSTOMER');
  }

  // LOGOUT (future use)
  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
