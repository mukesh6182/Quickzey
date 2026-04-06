import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // 1. Added RouterModule here
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../../services/store.service';
import { CartService } from '../../../services/cart.service';

declare var bootstrap: any;

@Component({
  selector: 'app-product-list',
  standalone: true,
  // 2. Added RouterModule to this array
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  subCategories: any[] = [];
  selectedSubCatId: string = '';
  categoryId: string = '';
  pincode: string = '';
  serverUrl = 'http://localhost:4000';

  selectedProduct: any = null;
  tempQuantity: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router, 
    private storeService: StoreService,
    private cartService: CartService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.categoryId = params['category'];
      this.storeService.pincode$.subscribe(pin => {
        this.pincode = pin;
        this.loadProducts();
      });
    });
  }

  loadProducts() {
    if (!this.pincode || !this.categoryId) return;
    this.storeService.getProductsByPincode(this.pincode, this.categoryId).subscribe({
      next: (res: any) => {
        this.products = res.products;
        this.filteredProducts = res.products;
        this.extractSubCategories(res.products);
      },
      error: (err) => console.error(err)
    });
  }

  extractSubCategories(products: any[]) {
    const subCatMap = new Map();
    products.forEach(item => {
      const sub = item.product.subCategory;
      if (sub && sub._id) subCatMap.set(sub._id, sub);
    });
    this.subCategories = Array.from(subCatMap.values());
  }

  onFilterChange() {
    this.filteredProducts = this.selectedSubCatId === '' ? this.products : 
      this.products.filter(item => item.product.subCategory?._id === this.selectedSubCatId);
  }

  openQuantityModal(item: any) {
    if (isPlatformBrowser(this.platformId)) {
      const userName = localStorage.getItem('userName') || 'Guest';
      const role = localStorage.getItem('role') || 'Guest';
      
      if (userName === 'Guest' || role !== 'CUSTOMER') {
        alert('Please login first to add items to your cart!');
        this.router.navigate(['/login']);
        return;
      }
    }

    this.selectedProduct = item;
    this.tempQuantity = 1;
    
    const modalEl = document.getElementById('qtyModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  adjustTempQty(delta: number) {
    const newQty = this.tempQuantity + delta;
    if (newQty >= 1 && newQty <= this.selectedProduct.stock) {
      this.tempQuantity = newQty;
    }
  }

  confirmAdd() {
    this.cartService.addToCart(this.selectedProduct, this.tempQuantity);
    const modalEl = document.getElementById('qtyModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }
}