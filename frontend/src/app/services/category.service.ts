import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = 'http://localhost:4000/admin/category'; // Your backend API endpoint

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Method to get authorization headers (if token exists in local storage)
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

  // Add new category with image (multipart/form-data)
  addCategory(data: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/add-category`, data, {
      headers: this.getHeaders().headers, // Use authorization headers
    });
  }

  // Get all categories (with optional status filter)
  getAllCategories(status: string = ''): Observable<any> {
    const url = status ? `${this.baseUrl}/all?status=${status}` : `${this.baseUrl}/all`;
    return this.http.get(url, this.getHeaders());
  }

  // Get category by ID
  getCategory(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`, this.getHeaders());
  }

  // Update category by ID
  updateCategory(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${id}`, data, this.getHeaders());
  }

  // Inactivate category by ID
  inactivateCategory(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/inactive/${id}`, {}, this.getHeaders());
  }

  // Delete category by ID
  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`, this.getHeaders());
  }
}
