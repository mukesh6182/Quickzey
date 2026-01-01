import { Component, Inject, OnInit, HostListener, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // For ngModel

declare var bootstrap: any; // Needed to access Bootstrap modal in TS

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  pincode: string = '380061';
  newPincode: string = '';
  userName: string = 'Guest';
  isDropdownOpen: boolean = false;
  showBack: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.pincode = localStorage.getItem('customerPincode') || '380061';
      this.userName = localStorage.getItem('userName') || 'Guest';
    }

    // Detect current URL for back button
    this.showBack = this.router.url !== '/';

    // Listen to route changes
    this.router.events.subscribe(() => {
      this.showBack = this.router.url !== '/';
    });
  }

  get isLoggedIn(): boolean {
    return this.userName !== 'Guest';
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    if (!(event.target as HTMLElement).closest('.dropdown-container')) {
      this.isDropdownOpen = false;
    }
  }

  // Open Bootstrap modal for changing pincode
  setPincode() {
    this.newPincode = this.pincode; // Prefill current pincode
    const modalEl = document.getElementById('pincodeModal');
    const modal = new bootstrap.Modal(modalEl!);
    modal.show();
  }

  // Save pincode from modal input
  savePincode() {
    if (this.newPincode.trim()) {
      this.pincode = this.newPincode.trim();
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('customerPincode', this.pincode);
      }
    }
  }
  toastMessage: string | null = null;
  toastType: string = 'success'; // 'success', 'danger', 'warning', etc.

logout() {
    // 1. Clear the storage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('userName');
      localStorage.removeItem('customerPincode'); // Optional: clear pincode on logout?
    }

    // 2. Reset local variables
    this.userName = 'Guest';
    this.isDropdownOpen = false;

    // 3. Trigger the Toast Message
    this.showToast('You have been successfully logged out!', 'success');
    
    // 4. Optional: Redirect to home or login
    // this.router.navigate(['/login']);
  }

  showToast(message: string, type: string) {
    this.toastMessage = message;
    this.toastType = type;

    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.toastMessage = null;
    }, 3000);
  }
  goBack() {
    window.history.back();
  }
}
