import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-deliveries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deliveries.component.html',
  styleUrl: './deliveries.component.css'
})
export class DeliveriesComponent implements OnInit {
  allDeliveries: any[] = [];
  filteredDeliveries: any[] = [];
  activeTab: 'OUT_FOR_DELIVERY' | 'DELIVERED' = 'OUT_FOR_DELIVERY';
  searchTerm: string = '';
  
  // OTP Verification Properties
  selectedOrderId: string | null = null;
  otpInput: string = '';
  isVerifying: boolean = false;

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadDeliveries();
  }

  loadDeliveries() {
    this.orderService.getPartnerDeliveries().subscribe({
      next: (res) => {
        this.allDeliveries = res.deliveries;
        this.applyFilter();
      },
      error: (err) => console.error('Error fetching deliveries', err)
    });
  }

  setTab(status: 'OUT_FOR_DELIVERY' | 'DELIVERED') {
    this.activeTab = status;
    this.applyFilter();
  }

  applyFilter() {
    this.filteredDeliveries = this.allDeliveries.filter(d => {
      const matchesTab = d.status === this.activeTab;
      const matchesSearch = d.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                            d._id.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }

  sort(key: string) {
    this.filteredDeliveries.sort((a, b) => (a[key] > b[key] ? 1 : -1));
  }

  // MODAL LOGIC
  markAsDelivered(orderId: string) {
    this.selectedOrderId = orderId;
    this.otpInput = '';
    const modalElement = document.getElementById('otpModal');
    if (modalElement) {
      modalElement.style.display = 'block';
      modalElement.classList.add('show');
    }
  }

  closeModal() {
    this.selectedOrderId = null;
    this.otpInput = '';
    const modalElement = document.getElementById('otpModal');
    if (modalElement) {
      modalElement.style.display = 'none';
      modalElement.classList.remove('show');
    }
  }

  confirmDelivery() {
    if (!this.otpInput || this.otpInput.length < 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    this.isVerifying = true;
    this.orderService.verifyOTP(this.selectedOrderId!, this.otpInput).subscribe({
      next: (res) => {
        this.isVerifying = false;
        this.closeModal();
        this.loadDeliveries(); // Refresh table
        alert('Order delivered successfully!');
      },
      error: (err) => {
        this.isVerifying = false;
        alert(err.error.message || 'Verification failed');
      }
    });
  }
}