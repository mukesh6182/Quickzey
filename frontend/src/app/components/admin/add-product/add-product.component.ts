import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../../services/product.service'; // ProductService to manage product operations

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
})
export class AddProductComponent implements OnInit {
  productForm!: FormGroup;

  categories: any[] = [];
  subCategories: any[] = [];
  selectedImages: File[] = [];
  imageError = '';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router  
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      subCategory: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.loadCategoriesAndSubcategories();
  }

  // Load both categories and subcategories in one API call
  loadCategoriesAndSubcategories() {
    this.productService.getCategoriesAndSubcategories().subscribe({
      next: (res: any) => {
        this.categories = res.categories || [];
        this.subCategories = res.subcategories || [];
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  // Filter subcategories by selected category
  getSubCategoriesByCategory() {
    const selectedCategoryId = this.productForm.get('category')?.value;
    return this.subCategories.filter((sc) => sc.category?._id === selectedCategoryId);
  }

  // ---------- IMAGE HANDLING ----------
  onImagesSelected(event: any) {
    this.imageError = '';
    const files: File[] = Array.from(event.target.files);

    if (files.length < 2) {
      this.imageError = 'Minimum 2 images are required';
      return;
    }

    if (files.length > 5) {
      this.imageError = 'Maximum 5 images allowed';
      return;
    }

    this.selectedImages = files;
  }

  // ---------- SUBMIT ----------
  submitProduct() {
    if (this.productForm.invalid) return;

    if (this.selectedImages.length < 2 || this.selectedImages.length > 5) {
      this.imageError = 'Please upload between 2 and 5 images';
      return;
    }

    const formData = new FormData();
    formData.append('name', this.productForm.value.name);
    formData.append('category', this.productForm.value.category);
    formData.append('subCategory', this.productForm.value.subCategory);
    formData.append('price', this.productForm.value.price);
    formData.append('description', this.productForm.value.description || '');

    this.selectedImages.forEach((image) => {
      formData.append('images', image); // IMPORTANT: backend expects "images"
    });

    this.productService.addProduct(formData).subscribe({
      next: () => {
        this.productForm.reset();
        this.selectedImages = [];
        this.router.navigate(['/admin/manage-product']); 
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Failed to add product');
      },
    });
  }
}
