import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StoreService } from '../../../services/store.service';

@Component({
  selector: 'app-add-store',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,    
  ],
  templateUrl: './add-store.component.html',
  styleUrls: ['./add-store.component.css']
})
export class AddStoreComponent {

  storeForm!: FormGroup;
  isSubmitting = false;
  managers: any[] = [];
  lastStoreMessage: string | null = null;

  toastMessage: string | null = null;
  toastType: 'success' | 'danger' = 'success';

  constructor(
    private fb: FormBuilder,
    private storeService: StoreService,
    private router: Router
  ) {
    this.storeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      storeCode: ['', Validators.required],
      servedPincodes: ['', Validators.required],
      line1: ['', Validators.required],
      area: ['', Validators.required],
      city: ['', Validators.required],
      pincode: ['', Validators.required],
      state: ['', Validators.required],
      manager: ['', Validators.required],
      status: ['ACTIVE']
    });
  }

  ngOnInit() {
    this.loadManagers();
    this.loadLastStoreCode();
  }

  loadManagers() {
    this.storeService.getManagers().subscribe({
      next: (res) => this.managers = res.data || [],
      error: () => this.managers = []
    });
  }

  loadLastStoreCode() {
    this.storeService.getLastStoreCode().subscribe({
      next: (res) => {
        if (!res.lastStoreCode) {
          this.storeForm.patchValue({ storeCode: 'QZ-AH-0101' });
          this.lastStoreMessage = 'First store code generated';
          return;
        }
        const parts = res.lastStoreCode.split('-');
        const number = parseInt(parts[2]) + 1;
        this.storeForm.patchValue({ storeCode: `QZ-AH-${number.toString().padStart(4, '0')}` });
        this.lastStoreMessage = `Previous Store Code: ${res.lastStoreCode}`;
      },
      error: () => this.lastStoreMessage = null
    });
  }

  onSubmit() {
    if (this.storeForm.invalid) return;

    this.isSubmitting = true;
    this.toastMessage = null;

    const payload = {
      ...this.storeForm.value,
      servedPincodes: this.storeForm.value.servedPincodes
        .split(',')
        .map((p: string) => p.trim())
    };

    this.storeService.addStore(payload).subscribe({
      next: (res: any) => {
        this.toastMessage = res.message || 'Store added successfully';
        this.toastType = 'success';
        setTimeout(() => {
          this.isSubmitting = false;
          this.router.navigate(['/admin/manage-store']);
        }, 1500);
      },
      error: (err) => {
        this.toastMessage = err.error?.message || 'Failed to add store';
        this.toastType = 'danger';
        this.isSubmitting = false;
        setTimeout(() => (this.toastMessage = null), 4000);
      }
    });
  }
}
