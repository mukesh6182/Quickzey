import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SubCategoryService } from '../../../services/subcategory.service';
import { CategoryService } from '../../../services/category.service';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { OverlayContainer } from '@angular/cdk/overlay';

declare var bootstrap: any;

@Component({
  selector: 'app-manage-subcategory',
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
  templateUrl: './manage-subcategory.component.html',
  styleUrls: ['./manage-subcategory.component.css']
})
export class ManageSubcategoryComponent implements OnInit, AfterViewInit {

  activeSubCategories: any[] = [];
  inactiveSubCategories: any[] = [];
  categories: any[] = [];

  activeDS = new MatTableDataSource<any>([]);
  inactiveDS = new MatTableDataSource<any>([]);

  displayedColumns: string[] = ['name', 'slug', 'category', 'image', 'status', 'actions'];

  pageSizeOptions = [5, 10, 25, 50];
  pageSize = 10;

  @ViewChild('activePaginator') activePaginator!: MatPaginator;
  @ViewChild('activeSort') activeSort!: MatSort;
  @ViewChild('inactivePaginator') inactivePaginator!: MatPaginator;
  @ViewChild('inactiveSort') inactiveSort!: MatSort;

  editForm!: FormGroup;
  @ViewChild('editModal') editModalRef!: ElementRef;
  modalInstance: any;

  currentEditingSubCategoryId: string | null = null;
  selectedImage: File | null = null;

  constructor(
    private subCategoryService: SubCategoryService,
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private overlayContainer: OverlayContainer  // <-- Inject OverlayContainer
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      slug: [{ value: '', disabled: true }],
      category: ['', Validators.required],
      image: [''],
      status: ['ACTIVE']
    });
  }

  ngOnInit(): void {
    this.loadCategories(); // Load categories first
    this.loadSubCategories();

    // Fix mat-select z-index inside bootstrap modal
    const overlayContainerElement = this.overlayContainer.getContainerElement();
    overlayContainerElement.style.zIndex = '1060'; // Higher than Bootstrap modal (1050)
  }

  ngAfterViewInit() {
    this.activeDS.paginator = this.activePaginator;
    this.activeDS.sort = this.activeSort;
    this.inactiveDS.paginator = this.inactivePaginator;
    this.inactiveDS.sort = this.inactiveSort;
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (res: any) => {
        this.categories = res.categories || [];
      },
      error: (err) => console.error(err)
    });
  }

  loadSubCategories(status?: string) {
    this.subCategoryService.getAllSubCategories().subscribe({
      next: (res: any) => {
        const subCategories = res.subcategories || [];
        this.activeSubCategories = subCategories.filter((sc: any) => sc.status === 'ACTIVE');
        this.inactiveSubCategories = subCategories.filter((sc: any) => sc.status === 'INACTIVE');

        if (status === 'ACTIVE') {
          this.activeDS.data = this.activeSubCategories;
          this.inactiveDS.data = [];
        } else if (status === 'INACTIVE') {
          this.inactiveDS.data = this.inactiveSubCategories;
          this.activeDS.data = [];
        } else {
          this.activeDS.data = this.activeSubCategories;
          this.inactiveDS.data = this.inactiveSubCategories;
        }
      },
      error: (err) => console.error(err)
    });
  }

  applyFilter(event: Event, type: 'active' | 'inactive') {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (type === 'active') {
      this.activeDS.filter = filterValue;
      if (this.activeDS.paginator) this.activeDS.paginator.firstPage();
    } else {
      this.inactiveDS.filter = filterValue;
      if (this.inactiveDS.paginator) this.inactiveDS.paginator.firstPage();
    }
  }

  changePageSize(size: number, type: 'active' | 'inactive') {
    this.pageSize = size;
    if (type === 'active' && this.activePaginator) this.activePaginator._changePageSize(size);
    if (type === 'inactive' && this.inactivePaginator) this.inactivePaginator._changePageSize(size);
  }

  openEdit(subCategory: any) {
    this.currentEditingSubCategoryId = subCategory._id;
    this.selectedImage = null;

    // Ensure categories are loaded first
    if (this.categories.length === 0) {
      this.categoryService.getAllCategories().subscribe({
        next: (res: any) => {
          this.categories = res.categories || [];
          this.patchEditForm(subCategory);
        },
        error: (err) => console.error(err)
      });
    } else {
      this.patchEditForm(subCategory);
    }

    this.modalInstance = new bootstrap.Modal(this.editModalRef.nativeElement);
    this.modalInstance.show();
  }

  patchEditForm(subCategory: any) {
    this.editForm.patchValue({
      name: subCategory.name,
      slug: subCategory.slug,
      category: subCategory.category?._id || '',
      image: '',
      status: subCategory.status
    });
  }

  onImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) this.selectedImage = file;
  }

  updateSubCategory() {
    if (!this.currentEditingSubCategoryId || this.editForm.invalid) return;

    const formData = new FormData();
    formData.append('name', this.editForm.value.name);
    formData.append('category', this.editForm.value.category);
    formData.append('status', this.editForm.value.status);

    if (this.selectedImage) formData.append('image', this.selectedImage);

    this.subCategoryService.updateSubCategory(this.currentEditingSubCategoryId, formData).subscribe({
      next: () => {
        this.modalInstance.hide();
        this.loadSubCategories();
      },
      error: (err) => console.error(err)
    });
  }

  deleteSubcategory(id: string) {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;
    this.subCategoryService.inactiveSubCategory(id).subscribe({
      next: () => this.loadSubCategories(),
      error: (err) => console.error(err)
    });
  }

  getImageUrl(subCategory: any): string {
    return subCategory.image ? `http://localhost:4000/${subCategory.image}` : 'No Image';
  }
}