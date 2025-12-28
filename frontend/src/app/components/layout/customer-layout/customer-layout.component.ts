import { Component, OnInit, Inject } from '@angular/core';
import { NavbarComponent } from '../../customer/navbar/navbar.component';
import { FooterComponent } from '../../customer/footer/footer.component';
import { RouterOutlet, RouterLink } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-customer-layout',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  standalone: true,
  templateUrl: './customer-layout.component.html',
  styleUrls: ['./customer-layout.component.css']
})
export class CustomerLayoutComponent implements OnInit {

  pincode: string = '380061';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const savedPincode = localStorage.getItem('customerPincode');
      if (savedPincode) {
        this.pincode = savedPincode;
      }
    }
  }

  setPincode() {
    if (isPlatformBrowser(this.platformId)) {
      const enteredPincode = prompt('Enter your pincode:', this.pincode);
      if (enteredPincode && enteredPincode.trim().length > 0) {
        this.pincode = enteredPincode.trim();
        localStorage.setItem('customerPincode', this.pincode);
      }
    }
  }
}
