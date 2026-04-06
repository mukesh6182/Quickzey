import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SubCategoryService {
  private baseUrl = 'http://localhost:4000/admin/subcategory'; // Make sure this matches your backend

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Get authorization headers if token exists
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

  // ---------------- ADD SUBCATEGORY ----------------
  addSubCategory(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/add-subcategory`, formData, this.getHeaders());
  }

  // ---------------- GET ALL SUBCATEGORIES ----------------
  getAllSubCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/all`, this.getHeaders());
  }

  // ---------------- UPDATE SUBCATEGORY ----------------
  updateSubCategory(subCategoryId: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${subCategoryId}`, formData, this.getHeaders());
  }

  // ---------------- INACTIVATE SUBCATEGORY ----------------
  inactiveSubCategory(subCategoryId: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/inactive/${subCategoryId}`, {}, this.getHeaders());
  }

  // ---------------- GET SUBCATEGORY BY ID ----------------
  getSubCategory(subCategoryId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${subCategoryId}`, this.getHeaders());
  }
}
