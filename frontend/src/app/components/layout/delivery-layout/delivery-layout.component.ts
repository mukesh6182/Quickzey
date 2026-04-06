import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../admin/footer/footer.component';
import { SidebarComponent as DeliverySidebar } from '../../delivery/sidebar/sidebar.component'; 
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-delivery-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet,  DeliverySidebar], 
  templateUrl: './delivery-layout.component.html',
  styleUrls: ['./delivery-layout.component.css']
})
export class DeliveryLayoutComponent implements OnInit {
  isCollapsed = false;
  isMobileOpen = false;
  deliveryStatus: string = 'OFF_DUTY'; 
  isLoading = false;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.fetchStatus();
  }

  // Helper to check if the toggle should be frozen
  get isStatusLocked(): boolean {
    return this.deliveryStatus === 'ASSIGNED' || this.isLoading;
  }

  fetchStatus() {
    this.userService.getProfile().subscribe({
      next: (res) => {
        if (res.user) this.deliveryStatus = res.user.deliveryStatus;
      },
      error: (err) => console.error('Status fetch failed', err)
    });
  }

  handleToggle() {
    if (window.innerWidth <= 992) {
      this.isMobileOpen = !this.isMobileOpen;
    } else {
      this.isCollapsed = !this.isCollapsed;
    }
  }

  toggleOnlineStatus() {
    if (this.isStatusLocked) return;

    this.isLoading = true;
    this.userService.toggleStatus().subscribe({
      next: (res) => {
        this.deliveryStatus = res.deliveryStatus;
        this.isLoading = false;
      },
      error: (err) => {
        alert(err.error?.message || 'Server error');
        this.isLoading = false;
        this.fetchStatus();
      }
    });
  }
}