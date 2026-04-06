import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  isLoading: boolean = true;
  isLoggedIn: boolean = false;
  serverUrl: string = 'http://localhost:4000'; 

  constructor(
    private orderService: OrderService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkUser(); // check login
      if (this.isLoggedIn) {
        this.loadOrders();
      }
    }
  }

  checkUser() {
    const user = localStorage.getItem('userName'); 
    const role = (localStorage.getItem('role') || '').toUpperCase();

    if (!user || user === 'Guest' || role !== 'CUSTOMER') {
      this.isLoggedIn = false;
      // Redirect to login with message
      this.router.navigate(['/login'], { queryParams: { message: 'Please login first' } });
    } else {
      this.isLoggedIn = true;
    }
  }

  loadOrders() {
    this.orderService.getMyOrders().subscribe({
      next: (res: any) => {
        this.orders = res.orders || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Fetch error:", err);
        this.isLoading = false;
      }
    });
  }

  getStatusBadge(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'bg-warning text-dark',
      'CONFIRMED': 'bg-info text-white',
      'SHIPPED': 'bg-primary text-white',
      'DELIVERED': 'bg-success text-white',
      'CANCELLED': 'bg-danger text-white'
    };
    return statusMap[status] || 'bg-secondary';
  }
}
