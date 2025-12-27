import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../customer/navbar/navbar.component';
import { FooterComponent } from '../../customer/footer/footer.component';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-customer-layout',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, RouterLink],
  standalone: true,
  templateUrl: './customer-layout.component.html',
  styleUrls: ['./customer-layout.component.css']
})
export class CustomerLayoutComponent implements OnInit {

  pincode: string = '380061'; // default pincode

  ngOnInit() {
    const savedPincode = localStorage.getItem('customerPincode');
    if (savedPincode) {
      this.pincode = savedPincode;
    }
  }

  setPincode() {
    const enteredPincode = prompt('Enter your pincode:', this.pincode);
    if (enteredPincode && enteredPincode.trim().length > 0) {
      this.pincode = enteredPincode.trim();
      localStorage.setItem('customerPincode', this.pincode);
    }
  }
}
