import { Component, OnInit, Inject } from '@angular/core';
import { NavbarComponent } from '../../customer/navbar/navbar.component';
import { FooterComponent } from '../../customer/footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HeaderComponent } from '../../customer/header/header.component';

@Component({
  selector: 'app-customer-layout',
  imports: [HeaderComponent,RouterOutlet, NavbarComponent, FooterComponent],
  standalone: true,
  templateUrl: './customer-layout.component.html',
  styleUrls: ['./customer-layout.component.css']
})
export class CustomerLayoutComponent {
}
