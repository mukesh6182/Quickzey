import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../../services/category.service'; // Adjust path
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule

@Component({
  selector: 'app-add-category',
  standalone: true, // Mark as standalone if you're using Angular 14+ standalone components
  imports: [CommonModule, ReactiveFormsModule], // Add required modules here
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css']
})
export class AddCategoryComponent {
  categoryForm!: FormGroup;
  isSubmitting = false;
  toastMessage: string | null = null;
  toastType: 'success' | 'danger' = 'success';
  selectedImage: any = null; // To hold the selected image

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private router: Router
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      order: [0, [Validators.required, Validators.min(0)]],  // Optional, if you need an order field
      image: [null, Validators.required] // File input validation
    });
  }

  // Check if a form control is invalid
  isInvalid(controlName: string): boolean {
    const control = this.categoryForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // Handle file change event
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file; // Store the selected file
      // Set the value of the form control for image
      this.categoryForm.get('image')?.setValue(file);
      // Mark the control as touched so validation triggers
      this.categoryForm.get('image')?.markAsTouched();
    }
  }

  // Handle form submission
  onSubmit(): void {
    if (this.categoryForm.invalid) return; // Prevent submission if form is invalid

    this.isSubmitting = true;
    this.toastMessage = null;

    // Create FormData to append form data and file
    const formData = new FormData();
    formData.append('name', this.categoryForm.get('name')?.value);
    formData.append('order', this.categoryForm.get('order')?.value);
    formData.append('image', this.selectedImage, this.selectedImage.name);

    // Call the service to add the category
    this.categoryService.addCategory(formData).subscribe({
      next: (res: any) => {
        this.toastMessage = res.message || 'Category added successfully';
        this.toastType = 'success';
        setTimeout(() => {
          this.isSubmitting = false;
          this.router.navigate(['/admin/manage-categories']); // Redirect after success
        }, 1500);
      },
      error: (err) => {
        this.toastMessage = err.error?.message || 'Failed to add category';
        this.toastType = 'danger';
        this.isSubmitting = false;
        setTimeout(() => (this.toastMessage = null), 4000);
      }
    });
  }
}
