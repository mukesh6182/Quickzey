import { Component, Inject, OnInit, HostListener, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../../services/store.service'; // Added import

declare var bootstrap: any;

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
  addressText: string = 'Ahmedabad, Gujarat, India';
  userName: string = 'Guest';
  isDropdownOpen: boolean = false;
  showBack: boolean = false;
  toastMessage: string | null = null;
  toastType: string = 'success';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private storeService: StoreService // Injected StoreService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.pincode = localStorage.getItem('customerPincode') || '380061';
      this.addressText = localStorage.getItem('customerAddress') || 'Ahmedabad, Gujarat, India';
      this.userName = localStorage.getItem('userName') || 'Guest';
    }

    this.showBack = this.router.url !== '/';
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

  setPincode() {
    this.newPincode = this.pincode;
    const modalEl = document.getElementById('pincodeModal');
    const modal = new bootstrap.Modal(modalEl!);
    modal.show();
  }

  savePincode() {
    const pin = this.newPincode.trim();
    if (!pin) return;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&postalcode=${pin}&country=India`)
      .then(res => res.json())
      .then((data: any[]) => {
        if (data && data.length > 0) {
          const place = data[0];
          this.pincode = pin;
          this.addressText = place.display_name;

          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('customerPincode', this.pincode);
            localStorage.setItem('customerAddress', this.addressText);
          }
          
          // MODIFIED: Update the service so Category component reacts
          this.storeService.updatePincode(this.pincode);

          this.showToast('Pincode updated successfully!', 'success');
        } else {
          this.showToast('Invalid Pincode! Reset to default.', 'warning');
          this.pincode = '380061';
          this.addressText = 'Ahmedabad, Gujarat, India';

          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('customerPincode', this.pincode);
            localStorage.setItem('customerAddress', this.addressText);
          }
          // Update service with default if invalid
          this.storeService.updatePincode(this.pincode);
        }
      })
      .catch(err => {
        console.error('Error fetching pincode:', err);
        this.showToast('Something went wrong! Resetting to default.', 'danger');
      });
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('userName');
      localStorage.removeItem('customerPincode');
      localStorage.removeItem('customerAddress');
    }
    this.userName = 'Guest';
    this.isDropdownOpen = false;
    this.showToast('You have been successfully logged out!', 'success');
  }

  showToast(message: string, type: string) {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => { this.toastMessage = null; }, 3000);
  }

  goBack() {
  this.router.navigate(['']); // Redirect to home page
}

}