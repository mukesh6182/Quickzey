import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '../../../services/store.service';
import { CartService } from '../../../services/cart.service';

declare var bootstrap: any;

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  productData: any;
  mainImage: string = '';
  serverUrl = 'http://localhost:4000';
  quantity: number = 1;

  constructor(
    private route: ActivatedRoute,
    private storeService: StoreService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.storeService.getProductById(id).subscribe((res: any) => {
        this.productData = res;
        this.mainImage = res.product.images[0];
      });
    }
  }

  setMainImage(img: string) {
    this.mainImage = img;
  }

  updateQty(delta: number) {
    const newQty = this.quantity + delta;
    if (this.productData && newQty >= 1 && newQty <= this.productData.stock) {
      this.quantity = newQty;
    }
  }

  openQuantityModal() {
    this.quantity = 1;
    const modalEl = document.getElementById('qtyModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  confirmAdd() {
    this.cartService.addToCart(this.productData, this.quantity);
    const modalEl = document.getElementById('qtyModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }
}