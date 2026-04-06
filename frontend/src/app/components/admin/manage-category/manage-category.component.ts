import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../../services/category.service';  // Import your CategoryService

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

declare var bootstrap: any; // Bootstrap JS for modals

@Component({
  selector: 'app-manage-category',
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
  templateUrl: './manage-category.component.html',
  styleUrls: ['./manage-category.component.css']
})
export class ManageCategoryComponent implements OnInit, AfterViewInit {

  activeCategories: any[] = [];
  inactiveCategories: any[] = [];

  activeDS = new MatTableDataSource<any>([]);
  inactiveDS = new MatTableDataSource<any>([]);

  displayedColumns: string[] = ['name', 'slug', 'image', 'status', 'actions'];

  pageSizeOptions = [5, 10, 25, 50];
  pageSize = 10;

  @ViewChild('activePaginator') activePaginator!: MatPaginator;
  @ViewChild('activeSort') activeSort!: MatSort;

  @ViewChild('inactivePaginator') inactivePaginator!: MatPaginator;
  @ViewChild('inactiveSort') inactiveSort!: MatSort;

  editForm!: FormGroup;
  @ViewChild('editModal') editModalRef!: ElementRef;
  modalInstance: any;

  currentEditingCategoryId: string | null = null;
  selectedImage: File | null = null; // Store the selected image file

  constructor(private categoryService: CategoryService, private fb: FormBuilder) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      slug: [{ value: '', disabled: true }],  // Disabled because slug is auto-generated
      image: ['', Validators.required],  // Image is required in case a new one is selected
      status: ['ACTIVE']
    });
  }

  ngOnInit(): void {
    this.loadCategories();  // Load categories initially (defaulting to both)
  }

  ngAfterViewInit() {
    this.activeDS.paginator = this.activePaginator;
    this.activeDS.sort = this.activeSort;

    this.inactiveDS.paginator = this.inactivePaginator;
    this.inactiveDS.sort = this.inactiveSort;
  }

  // Modified loadCategories method to filter by status if needed
  loadCategories(status?: string) {
    this.categoryService.getAllCategories().subscribe({
      next: (res: any) => {
        const categories = res.categories || [];
        this.activeCategories = categories.filter((c: any) => c.status === 'ACTIVE');
        this.inactiveCategories = categories.filter((c: any) => c.status === 'INACTIVE');

        // If status is provided, filter accordingly
        if (status) {
          if (status === 'ACTIVE') {
            this.activeDS.data = this.activeCategories;
            this.inactiveDS.data = [];
          } else if (status === 'INACTIVE') {
            this.inactiveDS.data = this.inactiveCategories;
            this.activeDS.data = [];
          }
        } else {
          // If no status, load both active and inactive categories
          this.activeDS.data = this.activeCategories;
          this.inactiveDS.data = this.inactiveCategories;
        }
      },
      error: (err) => console.error(err)
    });
  }

  applyFilter(event: Event, type: 'active' | 'inactive') {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    switch(type) {
      case 'active':
        this.activeDS.filter = filterValue;
        if (this.activeDS.paginator) {
          this.activeDS.paginator.firstPage();
        }
        break;
      case 'inactive':
        this.inactiveDS.filter = filterValue;
        if (this.inactiveDS.paginator) {
          this.inactiveDS.paginator.firstPage();
        }
        break;
    }
  }

  changePageSize(size: number, type: 'active' | 'inactive') {
    this.pageSize = size;
    switch(type) {
      case 'active':
        if (this.activePaginator) {
          this.activePaginator._changePageSize(size);
        }
        break;
      case 'inactive':
        if (this.inactivePaginator) {
          this.inactivePaginator._changePageSize(size);
        }
        break;
    }
  }

  openEdit(category: any) {
    this.currentEditingCategoryId = category._id;
    this.selectedImage = null; // Reset selected image

    this.editForm.patchValue({
      name: category.name,
      slug: category.slug,
      image: category.image, // Current image URL (not for file input)
      status: category.status
    });

    // Open the Bootstrap modal
    this.modalInstance = new bootstrap.Modal(this.editModalRef.nativeElement);
    this.modalInstance.show();
  }

  onImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;  // Store the selected image file
    }
  }

  updateCategory() {
    if (!this.currentEditingCategoryId || this.editForm.invalid) return;

    const formData = new FormData();
    formData.append('name', this.editForm.value.name);
    formData.append('status', this.editForm.value.status);
    formData.append('order', this.editForm.value.order || 0);

    // Append the selected image if it's not null
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    // Call the category service to update the category
    this.categoryService.updateCategory(this.currentEditingCategoryId, formData).subscribe({
      next: () => {
        this.modalInstance.hide();
        this.loadCategories();  // Reload categories after update
      },
      error: (err) => console.error(err)
    });
  }

  deleteCategory(id: string) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    this.categoryService.inactivateCategory(id).subscribe({
      next: () => this.loadCategories(),
      error: (err) => console.error(err)
    });
  }

  // Helper method to format category image URL if needed
  getImageUrl(category: any): string {
    return category.image ? `http://localhost:4000/${category.image}` : 'No Image';
  }
}
