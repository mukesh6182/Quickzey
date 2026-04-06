import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = 'http://localhost:4000/address';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAddresses(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }

  addAddress(addressData: any): Observable<any> {
    return this.http.post(this.apiUrl, addressData, { headers: this.getHeaders() });
  }

  updateAddress(id: string, addressData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, addressData, { headers: this.getHeaders() });
  }

  deleteAddress(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}