import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { StoreProductService } from '../../../services/store-product.service';
import { FormsModule } from '@angular/forms';

interface StoreProduct {
  _id: string;
  stock: number;
  status: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    status: string;
    category: any;
    subCategory: any;
  };
}

@Component({
  selector: 'app-manage-product',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass],
  templateUrl: './manage-product.component.html',
  styleUrls: ['./manage-product.component.css']
})
export class ManageProductComponent implements OnInit {
  storeProducts: StoreProduct[] = [];
  loading = false;
  message = 'Loading products...';

  // Modal state
  showModal = false;
  selectedProduct: StoreProduct | null = null;
  editStock = 0;
  editStatus = 'AVAILABLE';

  constructor(private storeProductService: StoreProductService) {}

  ngOnInit(): void {
    this.loadStoreProducts();
  }

  loadStoreProducts() {
    this.loading = true;
    this.storeProductService.getStoreProducts().subscribe(
      (res: any) => {
        this.loading = false;
        this.storeProducts = res.products || [];
        if (this.storeProducts.length === 0) {
          this.message = 'No products found in your store.';
        }
      },
      err => {
        console.error(err);
        this.loading = false;
        this.message = 'Failed to load products.';
      }
    );
  }

  getImageUrl(img: string): string {
    return `http://localhost:4000/${img}`;
  }

  // ---------------- MODAL ----------------

  openEditModal(product: StoreProduct) {
    this.selectedProduct = product;
    this.editStock = product.stock;
    this.editStatus = product.status;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedProduct = null;
  }

  updateProduct() {
    if (!this.selectedProduct) return;

    this.storeProductService
      .updateStoreProduct(this.selectedProduct._id, {
        stock: this.editStock,
        status: this.editStatus
      })
      .subscribe(
        () => {
          this.closeModal();
          this.loadStoreProducts();
        },
        err => {
          console.error(err);
          alert('Update failed');
        }
      );
  }

  deleteProduct(storeProductId: string) {
    if (!confirm('Are you sure you want to remove this product from store?')) return;

    this.storeProductService.deleteStoreProduct(storeProductId).subscribe(
      () => this.loadStoreProducts(),
      err => {
        console.error(err);
        alert('Delete failed');
      }
    );
  }
}
