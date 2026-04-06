import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:4000/admin'; // admin routes
  private customerUrl = 'http://localhost:4000/customer';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // SSR-safe Authorization Header
  private getHeaders(): { headers: HttpHeaders } {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token') || '';
    }
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
    return { headers };
  }

  /** Add new manager */
  addManager(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add-manager`, data, this.getHeaders());
  }

  /** Get all users */
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/all-users`, this.getHeaders());
  }

  /** Get user by ID */
  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${userId}`, this.getHeaders());
  }

  /** Update user */
  updateUser(userId: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update-user/${userId}`, data, this.getHeaders());
  }

  /** Disable / delete user */
  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete-user/${userId}`, this.getHeaders());
  }

  /** Get available managers (optional) */
  getAvailableManagers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/available-managers`, this.getHeaders());
  }
  getProfile(): Observable<any> {
    return this.http.get(`${this.customerUrl}/me`, this.getHeaders());
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.customerUrl}/update-me`, data, this.getHeaders());
  }

  addDeliveryPartner(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add-delivery-partner`, data, this.getHeaders());
  }
  // ... inside UserService class
  private partnerUrl = 'http://localhost:4000/delivery'; // Update based on your route prefix

  toggleStatus(): Observable<any> {
    return this.http.patch(`${this.partnerUrl}/toggle-status`, {}, this.getHeaders());
  }
// ...
}
