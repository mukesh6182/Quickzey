import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { StoreProductService } from '../../../services/store-product.service';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  status: string;
  images: string[];
  currentImageIndex?: number;
  category: any;
  subCategory: any;
}

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {
  categories: any[] = [];
  allSubcategories: any[] = [];
  subcategories: any[] = [];
  selectedCategory: string = '';
  selectedSubCategory: string = '';
  products: Product[] = [];
  message: string = 'Please select a category and subcategory';
  loading: boolean = false;

  // For modal
  showModal: boolean = false;
  selectedProduct: Product | null = null;
  quantity: number = 1;

  constructor(
    private productService: ProductService,
    private storeProductService: StoreProductService
  ) {}

  ngOnInit(): void {
    this.loadCategoriesAndSubcategories();
  }

  loadCategoriesAndSubcategories() {
    this.productService.getCategoriesAndSubcategories().subscribe(
      res => {
        if (res.success) {
          this.categories = res.categories;
          this.allSubcategories = res.subcategories;
          this.subcategories = res.subcategories;
        }
      },
      err => {
        console.error('Error loading categories:', err);
        this.message = 'Failed to load categories. Try again later.';
      }
    );
  }

  onCategoryChange() {
    this.selectedSubCategory = '';
    this.products = [];
    this.message = 'Please select a subcategory';

    this.subcategories = this.allSubcategories.filter(
      sub => sub.category && sub.category._id === this.selectedCategory
    );
  }

  onSubCategoryChange() {
    if (!this.selectedCategory || !this.selectedSubCategory) {
      this.products = [];
      this.message = 'Please select both category and subcategory';
      return;
    }

    this.loading = true;
    this.storeProductService
      .getProductsByCategoryAndSubcategory(this.selectedCategory, this.selectedSubCategory)
      .subscribe(
        res => {
          this.loading = false;
          if (res.success && res.products.length > 0) {
            this.products = res.products.map((p: Product) => ({ ...p, currentImageIndex: 0 }));
            this.message = '';
          } else {
            this.products = [];
            this.message = 'No products found for selected category and subcategory';
          }
        },
        err => {
          this.loading = false;
          console.error(err);
          this.products = [];
          this.message = 'Error fetching products';
        }
      );
  }

  // ---------------- Image Slider ----------------
  getImageUrl(img: string): string {
    return `http://localhost:4000/${img}`;
  }

  getCurrentImage(product: Product): string {
    if (!product.images || product.images.length === 0) return '';
    if (product.currentImageIndex === undefined) product.currentImageIndex = 0;
    return this.getImageUrl(product.images[product.currentImageIndex]);
  }

  prevImage(product: Product) {
    if (!product.images || product.images.length === 0) return;
    product.currentImageIndex =
      (product.currentImageIndex! - 1 + product.images.length) % product.images.length;
  }

  nextImage(product: Product) {
    if (!product.images || product.images.length === 0) return;
    product.currentImageIndex =
      (product.currentImageIndex! + 1) % product.images.length;
  }

  // ---------------- Modal Logic ----------------
  openAddModal(product: Product) {
    this.selectedProduct = product;
    this.quantity = 1;  // reset quantity
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedProduct = null;
  }

  incrementQuantity() {
    this.quantity++;
  }

  decrementQuantity() {
    if (this.quantity > 1) this.quantity--;
  }

  submitStoreProduct() {
    if (!this.selectedProduct) return;

    const payload = {
      productId: this.selectedProduct._id,
      stock: this.quantity,
      status: 'AVAILABLE'
    };

    this.storeProductService.addStoreProduct(payload).subscribe(
      res => {
        alert(res.message);
        this.closeModal();
      },
      err => {
        console.error('Add to store failed', err);
        alert(err.error?.message || 'Failed to add product to store');
      }
    );
  }
}
