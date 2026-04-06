import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:4000/customer/place-order';
  private deliveryUrl = 'http://localhost:4000/delivery';

  constructor(private http: HttpClient) {}
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
  createOrder(orderData: any) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl, orderData, { headers });
  }  
  private baseUrl = 'http://localhost:4000/customer';

  getMyOrders() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.baseUrl}/my-orders`, { headers });
  }
  getPartnerDeliveries(): Observable<any> {
    return this.http.get(`${this.deliveryUrl}/partner-deliveries`, { 
      headers: this.getHeaders() 
    });
  }
  verifyOTP(orderId: string, otp: string): Observable<any> {
    return this.http.post(`${this.deliveryUrl}/verify-otp`, { orderId, otp }, { 
      headers: this.getHeaders() 
    });
  }
}