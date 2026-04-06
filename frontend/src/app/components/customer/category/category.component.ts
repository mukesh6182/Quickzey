import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router'; // Added Router for navigation
import { StoreService } from '../../../services/store.service';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  categories: any[] = [];
  pincode: string = ''; 
  serverUrl = 'http://localhost:4000';

  constructor(
    private storeService: StoreService,
    private router: Router, // Injected Router
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // MODIFIED: Subscribe to pincode changes from service
    this.storeService.pincode$.subscribe((newPin) => {
      this.pincode = newPin;
      this.loadCategories(); 
    });
  }

  loadCategories() {
    if (!this.pincode) return;
    
    this.storeService.getCategoriesByPincode(this.pincode).subscribe({
      next: (res: any) => {
        this.categories = res.categories.map((cat: any) => ({
          id: cat._id, // Store the ID for navigation
          title: cat.name,
          image: cat.image ? `${this.serverUrl}/${cat.image}` : 'assets/categories/default.png'
        }));
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.categories = [];
      }
    });
  }

  /**
   * Navigates to the products page with the selected category ID
   */
  viewProducts(categoryId: string) {
    if (!categoryId) return;
    this.router.navigate(['/products'], { 
      queryParams: { category: categoryId } 
    });
  }
}