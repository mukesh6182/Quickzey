import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { OverlayContainer } from '@angular/cdk/overlay';
import { ProductService } from '../../../services/product.service';

declare var bootstrap: any;

@Component({
  selector: 'app-manage-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './manage-product.component.html',
  styleUrls: ['./manage-product.component.css']
})
export class ManageProductComponent implements OnInit, AfterViewInit {

  activeProducts: any[] = [];
  inactiveProducts: any[] = [];

  activeDS = new MatTableDataSource<any>([]);
  inactiveDS = new MatTableDataSource<any>([]);

  displayedColumns: string[] = [
    'name', 'category', 'subCategory', 'price', 'images', 'status', 'actions'
  ];

  pageSizeOptions = [5, 10, 25, 50];
  pageSize = 10;

  @ViewChild('activePaginator') activePaginator!: MatPaginator;
  @ViewChild('inactivePaginator') inactivePaginator!: MatPaginator;
  @ViewChild('activeSort') activeSort!: MatSort;
  @ViewChild('inactiveSort') inactiveSort!: MatSort;

  @ViewChild('editModal') editModalRef!: ElementRef;
  modalInstance: any;

  editForm!: FormGroup;
  currentProductId: string | null = null;
  selectedImages: File[] = [];
  imageError = '';

  categories: any[] = [];
  subcategories: any[] = [];
  allSubcategories: any[] = [];

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private overlayContainer: OverlayContainer
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', Validators.required],
      description: [''],
      category: ['', Validators.required],
      subCategory: ['', Validators.required],
      status: ['ACTIVE']
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.overlayContainer.getContainerElement().style.zIndex = '1060';
  }

  ngAfterViewInit(): void {
    this.activeDS.paginator = this.activePaginator;
    this.activeDS.sort = this.activeSort;
    this.inactiveDS.paginator = this.inactivePaginator;
    this.inactiveDS.sort = this.inactiveSort;
  }

  loadProducts(status?: 'ACTIVE' | 'INACTIVE') {
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        const products = res.products || [];
        this.activeProducts = products.filter((p: any) => p.status === 'ACTIVE');
        this.inactiveProducts = products.filter((p: any) => p.status === 'INACTIVE');

        if (status === 'ACTIVE') {
          this.activeDS.data = this.activeProducts;
          this.inactiveDS.data = [];
        } else if (status === 'INACTIVE') {
          this.inactiveDS.data = this.inactiveProducts;
          this.activeDS.data = [];
        } else {
          this.activeDS.data = this.activeProducts;
          this.inactiveDS.data = this.inactiveProducts;
        }
      },
      error: err => console.error(err)
    });
  }

  applyFilter(event: Event, type: 'active' | 'inactive') {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (type === 'active') {
      this.activeDS.filter = value;
      this.activeDS.paginator?.firstPage();
    } else {
      this.inactiveDS.filter = value;
      this.inactiveDS.paginator?.firstPage();
    }
  }

  loadCategories() {
    this.productService.getCategoriesAndSubcategories().subscribe({
      next: (res: any) => {
        this.categories = res.categories || [];
        this.allSubcategories = res.subcategories || [];
      },
      error: err => console.error(err)
    });
  }

  openEdit(product: any) {
    this.currentProductId = product._id;
    this.selectedImages = [];
    this.imageError = '';

    // Filter subcategories for this product's category
    this.subcategories = this.allSubcategories.filter(
      sc => sc.category._id.toString() === product.category._id.toString()
    );

    // Patch values after filtering subcategories
    this.editForm.patchValue({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category._id,
      subCategory: product.subCategory?._id || '',
      status: product.status
    });

    this.modalInstance = new bootstrap.Modal(this.editModalRef.nativeElement);
    this.modalInstance.show();
  }

  onCategoryChange(event: any) {
    const selectedCatId = event.target.value;

    // Filter subcategories for selected category
    this.subcategories = this.allSubcategories.filter(
      sc => sc.category._id.toString() === selectedCatId.toString()
    );

    // Reset subcategory if current one doesn't belong
    const currentSub = this.editForm.value.subCategory;
    if (!this.subcategories.some(sc => sc._id.toString() === currentSub?.toString())) {
      this.editForm.patchValue({ subCategory: '' });
    }
  }

  onImagesSelected(event: any) {
    const files: File[] = Array.from(event.target.files);
    if (files.length < 2 || files.length > 5) {
      this.imageError = 'Please select 2 to 5 images';
      this.selectedImages = [];
      return;
    }
    this.imageError = '';
    this.selectedImages = files;
  }

  updateProduct() {
    if (!this.currentProductId || this.editForm.invalid) return;

    const formData = new FormData();
    formData.append('name', this.editForm.value.name);
    formData.append('price', this.editForm.value.price);
    formData.append('description', this.editForm.value.description || '');
    formData.append('status', this.editForm.value.status);
    formData.append('category', this.editForm.value.category);
    formData.append('subCategory', this.editForm.value.subCategory);

    this.selectedImages.forEach(img => formData.append('images', img));

    this.productService.updateProduct(this.currentProductId, formData).subscribe({
      next: () => {
        this.modalInstance.hide();
        this.loadProducts();
      },
      error: err => console.error(err)
    });
  }

  deleteProduct(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    this.productService.deleteProduct(id).subscribe({
      next: () => this.loadProducts(),
      error: err => console.error(err)
    });
  }

  getImageUrl(img: string): string {
    return `http://localhost:4000/${img}`;
  }
}
