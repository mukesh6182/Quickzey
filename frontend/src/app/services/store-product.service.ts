import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class StoreProductService {
  private baseUrl = 'http://localhost:4000/manager/store-product';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getHeaders(): { headers: HttpHeaders } {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token') || '';
    }

    return {
      headers: new HttpHeaders({
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      })
    };
  }

  addStoreProduct(data: { productId: string; stock: number; status: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, data, this.getHeaders());
  }

  getStoreProducts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/all`, this.getHeaders());
  }

  updateStoreProduct(
    storeProductId: string,
    data: { stock?: number; status?: string }
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${storeProductId}`, data, this.getHeaders());
  }

  deleteStoreProduct(storeProductId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/remove/${storeProductId}`, this.getHeaders());
  }

  getProductsByCategoryAndSubcategory(
    categoryId?: string,
    subCategoryId?: string
  ): Observable<any> {
    let params = new HttpParams();
    if (categoryId) params = params.set('categoryId', categoryId);
    if (subCategoryId) params = params.set('subCategoryId', subCategoryId);

    return this.http.get(`${this.baseUrl}/products`, {
      headers: this.getHeaders().headers,
      params
    });
  }
}
