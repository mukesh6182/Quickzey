import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent {

  categories = [
    { title: 'Stationery', image: 'assets/categories/stationery.png' },
    { title: 'Biscuits', image: 'assets/categories/biscuits.png' },
    { title: 'Ice Creams', image: 'assets/categories/icecream.png' },
    { title: 'Snacks', image: 'assets/categories/snacks.png' },
    { title: 'Sweets', image: 'assets/categories/sweets.png' },
    { title: 'Chocolates & Candies', image: 'assets/categories/chocolates.png' },
    { title: 'Drinks & Beverages', image: 'assets/categories/drinks.png' },
    { title: 'Dairy', image: 'assets/categories/dairy.png' },
    { title: 'Kitchen Essentials', image: 'assets/categories/kitchen.png' },    
  ];

}
