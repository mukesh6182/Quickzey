import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubCategoryService } from '../../../services/subcategory.service';
import { CategoryService } from '../../../services/category.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-subcategory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-subcategory.component.html',
  styleUrls: ['./add-subcategory.component.css']
})
export class AddSubCategoryComponent implements OnInit {
  subCategoryForm!: FormGroup;
  isSubmitting = false;
  toastMessage: string | null = null;
  toastType: 'success' | 'danger' = 'success';
  selectedImage: any = null;
  categories: any[] = []; // To hold all categories for the dropdown

  constructor(
    private fb: FormBuilder,
    private subCategoryService: SubCategoryService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subCategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      order: [0, Validators.min(0)],
      image: [null, Validators.required]
    });

    // Fetch all categories for dropdown
    this.categoryService.getAllCategories('ACTIVE').subscribe({
      next: (res: any) => this.categories = res.categories,
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.subCategoryForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      this.subCategoryForm.get('image')?.setValue(file);
      this.subCategoryForm.get('image')?.markAsTouched();
    }
  }

  onSubmit(): void {
    if (this.subCategoryForm.invalid) return;

    this.isSubmitting = true;
    this.toastMessage = null;

    const formData = new FormData();
    formData.append('name', this.subCategoryForm.get('name')?.value);
    formData.append('category', this.subCategoryForm.get('category')?.value);
    formData.append('order', this.subCategoryForm.get('order')?.value);
    formData.append('image', this.selectedImage, this.selectedImage.name);

    this.subCategoryService.addSubCategory(formData).subscribe({
      next: (res: any) => {
        this.toastMessage = res.message || 'Subcategory added successfully';
        this.toastType = 'success';
        setTimeout(() => {
          this.isSubmitting = false;
          this.router.navigate(['/admin/manage-subcategories']);
        }, 1500);
      },
      error: (err) => {
        this.toastMessage = err.error?.message || 'Failed to add subcategory';
        this.toastType = 'danger';
        this.isSubmitting = false;
        setTimeout(() => (this.toastMessage = null), 4000);
      }
    });
  }
}
