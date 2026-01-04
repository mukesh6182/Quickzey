import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:4000/admin'; // admin routes

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
}
