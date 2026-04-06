import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<any[]>([]);
  cart$ = this.cartItems.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadCart();
  }

  private loadCart() {
    if (isPlatformBrowser(this.platformId)) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        this.cartItems.next(JSON.parse(savedCart));
      }
    }
  }

  // Helper to get current value without subscription
  getCartValue() {
    return this.cartItems.value;
  }

  addToCart(product: any, quantity: number) {
    const currentCart = [...this.cartItems.value]; // Copy to avoid mutation issues
    const index = currentCart.findIndex(item => item.storeProductId === product._id);

    if (index > -1) {
      currentCart[index].quantity += quantity;
    } else {
      currentCart.push({
        storeProductId: product._id,
        name: product.product.name,
        price: product.product.price,
        image: product.product.images[0],
        quantity: quantity,
        maxStock: product.stock
      });
    }
    this.updateCart(currentCart);
  }

  updateQuantity(id: string, delta: number) {
    const currentCart = [...this.cartItems.value];
    const index = currentCart.findIndex(item => item.storeProductId === id);
    if (index > -1) {
      currentCart[index].quantity += delta;
      if (currentCart[index].quantity <= 0) {
        currentCart.splice(index, 1);
      } else if (currentCart[index].quantity > currentCart[index].maxStock) {
        currentCart[index].quantity = currentCart[index].maxStock;
      }
      this.updateCart(currentCart);
    }
  }

  private updateCart(cart: any[]) {
    this.cartItems.next(cart);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }

  clearCart() {
    this.cartItems.next([]);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('cart');
    }
  }

  getTotal() {
    return this.cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
}