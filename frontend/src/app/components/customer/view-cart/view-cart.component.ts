import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../services/cart.service';
import { AddressService } from '../../../services/address.service';
import { OrderService } from '../../../services/order.service';

declare var bootstrap: any;

@Component({
  selector: 'app-view-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './view-cart.component.html',
  styleUrls: ['./view-cart.component.css']
})
export class ViewCartComponent implements OnInit {
  cartItems: any[] = [];
  total: number = 0;
  isLoggedIn: boolean = false;
  serverUrl = 'http://localhost:4000';

  addresses: any[] = [];
  selectedAddress: any = null;
  isPlacingOrder: boolean = false;
  isEditMode: boolean = false;
  currentAddressId: string | null = null;

  addressForm = {
    addressLine: '',
    landmark: '',
    city: '',
    state: 'Gujarat',
    pincode: '',
    label: 'HOME',
    isDefault: false
  };

  constructor(
    private cartService: CartService,
    private addressService: AddressService,
    private orderService: OrderService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkUser();  // Check login status
      if (this.isLoggedIn) {
        this.loadCart();
        this.loadAddresses();
      }
    }
  }

 checkUser() {
  const user = localStorage.getItem('userName'); 
  const role = (localStorage.getItem('role') || '').toUpperCase();

  if (!user || user === 'Guest' || role !== 'CUSTOMER') {
    this.isLoggedIn = false;
    // Redirect to login with a message as query param
    this.router.navigate(['/login'], { queryParams: { message: 'Please login first' } });
  } else {
    this.isLoggedIn = true;
  }
}

  loadCart() {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.total = this.cartService.getTotal();
    });
  }

  loadAddresses() {
    this.addressService.getAddresses().subscribe((res: any) => {
      this.addresses = res.addresses || [];
      if (!this.selectedAddress && this.addresses.length > 0) {
        // Find default or pick the first one
        this.selectedAddress = this.addresses.find(a => a.isDefault) || this.addresses[0];
      }
    });
  }

  placeOrder() {

  if (this.isPlacingOrder) return; // prevent multiple clicks

  if (!this.selectedAddress) {
    alert('Please select a delivery address first!');
    this.onAddressButtonClick();
    return;
  }

  if (this.cartItems.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  this.isPlacingOrder = true; // start loading

  const orderData = {
    products: this.cartItems,
    totalAmount: this.total,
    address: this.selectedAddress
  };

  this.orderService.createOrder(orderData).subscribe({
    next: (res: any) => {

      this.isPlacingOrder = false;

      alert('🎉 Order Placed Successfully!');
      this.cartService.clearCart();
      this.router.navigate(['/orders']);
    },

    error: (err) => {

      this.isPlacingOrder = false;

      const errorMsg = err.error?.message || 'Failed to place order. Please try again.';
      alert(errorMsg);
    }
  });
}

  changeQty(id: string, delta: number) {
    this.cartService.updateQuantity(id, delta);
  }

  onAddressButtonClick() {
    if (this.addresses.length === 0) {
      this.openAddressFormModal();
    } else {
      const listModalEl = document.getElementById('addressListModal');
      if (listModalEl) {
        const modal = new bootstrap.Modal(listModalEl);
        modal.show();
      }
    }
  }

  resetAddressForm() {
    this.isEditMode = false;
    this.currentAddressId = null;
    this.addressForm = {
      addressLine: '',
      landmark: '',
      city: '',
      state: 'Gujarat',
      pincode: '',
      label: 'HOME',
      isDefault: false
    };
  }

  openAddressFormModal(address: any = null) {
    const listModalEl = document.getElementById('addressListModal');
    const listModalInstance = bootstrap.Modal.getInstance(listModalEl);
    if (listModalInstance) listModalInstance.hide();

    if (address) {
      this.isEditMode = true;
      this.currentAddressId = address._id;
      this.addressForm = { ...address };
    } else {
      this.resetAddressForm();
    }

    setTimeout(() => {
      const formModalEl = document.getElementById('addressFormModal');
      if (formModalEl) {
        const formModal = new bootstrap.Modal(formModalEl);
        formModal.show();
      }
    }, 250);
  }

  saveAddress() {
    const action = (this.isEditMode && this.currentAddressId)
      ? this.addressService.updateAddress(this.currentAddressId, this.addressForm)
      : this.addressService.addAddress(this.addressForm);

    action.subscribe({
      next: () => this.completeAddressAction(),
      error: (err) => alert('Error saving address')
    });
  }

  completeAddressAction() {
    this.loadAddresses();
    const formModalEl = document.getElementById('addressFormModal');
    const formModalInstance = bootstrap.Modal.getInstance(formModalEl);
    if (formModalInstance) formModalInstance.hide();

    setTimeout(() => {
      const listModalEl = document.getElementById('addressListModal');
      if (listModalEl) {
        const listModal = new bootstrap.Modal(listModalEl);
        listModal.show();
      }
    }, 300);
  }

  deleteAddress(id: string, event: Event) {
    event.stopPropagation();
    if (confirm('Remove this address?')) {
      this.addressService.deleteAddress(id).subscribe(() => {
        if (this.selectedAddress && this.selectedAddress._id === id) {
          this.selectedAddress = null;
        }
        this.loadAddresses();
      });
    }
  }

  selectAddress(address: any) {
    this.selectedAddress = address;
    const listModalEl = document.getElementById('addressListModal');
    const listModalInstance = bootstrap.Modal.getInstance(listModalEl);
    if (listModalInstance) listModalInstance.hide();
  }
}
