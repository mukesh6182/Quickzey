import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private baseUrl = 'http://localhost:4000/admin/product';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Method to get Authorization headers
  private getHeaders(): { headers: HttpHeaders } {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token') || '';
    }

    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });

    return { headers };
  }

  // Fetch categories and subcategories in one API call
  getCategoriesAndSubcategories(): Observable<any> {
    return this.http.get(`http://localhost:4000/admin/categories-and-subcategories`, this.getHeaders());
  }

  // Add Product
  addProduct(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, formData, this.getHeaders());
  }

  // Get All Products
  getProducts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/all`, this.getHeaders());
  }

  // Update Product
  updateProduct(productId: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${productId}`, formData, this.getHeaders());
  }

  // Delete Product
  deleteProduct(productId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${productId}`, this.getHeaders());
  }
}
