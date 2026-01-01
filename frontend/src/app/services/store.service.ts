import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private baseUrl = 'http://localhost:4000/store';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * SSR-safe Authorization Header
   */
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

  addStore(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add-store`, data, this.getHeaders());
  }

  getAllStores(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-stores`, this.getHeaders());
  }

  updateStore(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update-store/${id}`, data, this.getHeaders());
  }

  deleteStore(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete-store/${id}`, this.getHeaders());
  }

  setMaintenance(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/maintenance-store/${id}`, {}, this.getHeaders());
  }

  getManagers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-managers`, this.getHeaders());
  }

  getLastStoreCode(): Observable<any> {
    return this.http.get(`${this.baseUrl}/last-store-code`, this.getHeaders());
  }
}
