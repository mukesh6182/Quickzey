import { HttpParams } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs'; // Added BehaviorSubject
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private baseUrl = 'http://localhost:4000/store';
  private customerBaseUrl = 'http://localhost:4000/customer';

  // NEW: State management for pincode
  private pincodeSubject = new BehaviorSubject<string>('380061');
  pincode$ = this.pincodeSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Initialize state from storage on load
    if (isPlatformBrowser(this.platformId)) {
      const savedPin = localStorage.getItem('customerPincode');
      if (savedPin) this.pincodeSubject.next(savedPin);
    }
  }

  // NEW: Method to push update to all subscribers
  updatePincode(pin: string) {
    this.pincodeSubject.next(pin);
  }

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

  getCategoriesByPincode(pincode: string): Observable<any> {
    return this.http.get(`${this.customerBaseUrl}/categories-by-pincode?pincode=${pincode}`);
  }

  // Inside StoreService
  getProductsByPincode(pincode: string, catId?: string, subCatId?: string): Observable<any> {
    let params = new HttpParams().set('pincode', pincode);
    if (catId) params = params.set('categoryId', catId);
    if (subCatId) params = params.set('subCategoryId', subCatId);

    return this.http.get(`${this.customerBaseUrl}/get-prdocuts`, { params });
  }

  getProuctById(id: string) {
    return this.http.get(`${this.customerBaseUrl}/store-product/${id}`);
  }
  getProductById(id: string) {
    return this.http.get(`${this.customerBaseUrl}/store-product/${id}`);
  }

  getOrdersByStore(status?: string): Observable<any> {
    let params = new HttpParams();
    if (
      status) params = params.set('status', status);

    return this.http.get(`${this.baseUrl}/orders`, { headers: this.getHeaders().headers, params });
  }
  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/order-status/${orderId}`,
      { status },  // sending status in request body
      this.getHeaders()
    );
  }
  
  getOrderById(orderId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/orders/${orderId}`, this.getHeaders());
  }

  getNearbyDeliveryPartners(pincode: string, limit?: number): Observable<any> {
    let params = new HttpParams().set('pincode', pincode);
    if (limit) params = params.set('limit', limit.toString());

    return this.http.get(`${this.baseUrl}/nearby-delivery-partners`, { 
      headers: this.getHeaders().headers,
      params 
      });
  }
  
  assignPartner(orderId: string, partnerId: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/assign-partner`, 
      { orderId, partnerId }, 
      this.getHeaders()
    );
  }
  
}