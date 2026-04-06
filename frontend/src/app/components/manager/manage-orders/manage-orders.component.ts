import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { StoreService } from '../../../services/store.service';

declare var bootstrap: any;

@Component({
  selector: 'app-manage-orders',
  templateUrl: './manage-orders.component.html',
  styleUrls: ['./manage-orders.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule
  ]
})
export class ManageOrdersComponent implements OnInit {
  loading = true;
  message = '';
  storeName = '';
  loadingStatusMap: { [orderId: string]: boolean } = {};
  
  selectedOrder: any = null;
  nearbyPartners: any[] = [];
  loadingPartners = false;

  statuses = [
    'PENDING', 
    'CONFIRMED', 
    'PREPARING', 
    'READY_FOR_PICKUP', 
    'OUT_FOR_DELIVERY', 
    'DELIVERED', 
    'CANCELLED'
  ];

  displayedColumns: string[] = [
    'orderId', 
    'customer', 
    'phone', 
    'address', 
    'totalAmount', 
    'payment', 
    'status', 
    'placedAt',
    'actions' 
  ];

  dataSources: { [key: string]: MatTableDataSource<any> } = {};

  @ViewChildren(MatPaginator) set matPaginators(paginators: QueryList<MatPaginator>) {
    if (paginators.length > 0) {
      const paginatorArray = paginators.toArray();
      this.statuses.forEach((status, index) => {
        if (this.dataSources[status]) {
          this.dataSources[status].paginator = paginatorArray[index];
        }
      });
    }
  }

  constructor(private storeService: StoreService) {
    this.statuses.forEach(status => {
      this.dataSources[status] = new MatTableDataSource<any>([]);
    });
  }

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders() {
    this.loading = true;
    this.storeService.getOrdersByStore().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.storeName = res.storeName;
          const groupedData = res.data;
          this.statuses.forEach(status => {
            this.dataSources[status].data = groupedData[status] || [];
          });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Fetch error:', err);
        this.message = 'Could not load orders.';
        this.loading = false;
      }
    });
  }

  updateStatus(order: any) {
    if (this.loadingStatusMap[order._id]) return;

    if (order.status === 'READY_FOR_PICKUP') {
      this.openAssignModal(order);
      return;
    }

    let nextStatus = '';
    if (order.status === 'PENDING') nextStatus = 'CONFIRMED';
    else if (order.status === 'CONFIRMED') nextStatus = 'PREPARING';
    else if (order.status === 'PREPARING') nextStatus = 'READY_FOR_PICKUP';

    if (!nextStatus) return;

    this.loadingStatusMap[order._id] = true;
    this.storeService.updateOrderStatus(order._id, nextStatus).subscribe({
      next: () => {
        this.loadingStatusMap[order._id] = false;
        this.fetchOrders();
      },
      error: (err) => {
        this.loadingStatusMap[order._id] = false;
        alert('Failed to update status');
      }
    });
  }

  openAssignModal(order: any) {
    this.selectedOrder = order;
    this.loadingPartners = true;
    this.nearbyPartners = [];

    const targetPincode = order.pincode || '380061'; 

    this.storeService.getNearbyDeliveryPartners(targetPincode).subscribe({
      next: (res: any) => {
        this.nearbyPartners = res.data || [];
        this.loadingPartners = false;
        const modalElement = document.getElementById('assignPartnerModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      },
      error: (err) => {
        this.loadingPartners = false;
        alert('Could not find delivery partners.');
      }
    });
  }

  // UPDATED METHOD: Uses the specialized assignPartner route
  assignPartner(partner: any) {
    if (!this.selectedOrder) return;
    
    this.loadingStatusMap[this.selectedOrder._id] = true;
    
    this.storeService.assignPartner(this.selectedOrder._id, partner._id).subscribe({
      next: (res: any) => {
        this.loadingStatusMap[this.selectedOrder._id] = false;
        
        // Inform user of generated OTP
        alert(`Partner ${partner.name} assigned! `);
        
        // Close Modal using Bootstrap instance
        const modalElement = document.getElementById('assignPartnerModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
        
        this.fetchOrders();
      },
      error: (err) => {
        console.error('Assignment error:', err);
        this.loadingStatusMap[this.selectedOrder._id] = false;
        alert(err.error?.message || 'Failed to assign partner.');
      }
    });
  }

  getActionLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'Mark as Confirmed';
      case 'CONFIRMED': return 'Start Preparing';
      case 'PREPARING': return 'Ready for Pickup';
      case 'READY_FOR_PICKUP': return 'Assign Partner';
      default: return '';
    }
  }

  applyFilter(event: Event, status: string) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSources[status].filter = filterValue.trim().toLowerCase();
  }

  formatAddress(order: any) {
    return `${order.addressLine}, ${order.city}`;
  }

  formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString();
  }
}