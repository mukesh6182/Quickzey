import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../../services/store.service';

declare var bootstrap: any; // Use Bootstrap JS globally

@Component({
  selector: 'app-manage-store',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-store.component.html',
  styleUrls: ['./manage-store.component.css']
})
export class ManageStoreComponent implements OnInit {
  activeStores: any[] = [];
  inactiveStores: any[] = [];
  maintenanceStores: any[] = [];

  editForm!: FormGroup;
  @ViewChild('editModal') editModalRef!: ElementRef;
  modalInstance: any;

  currentEditingStoreId: string | null = null;

  constructor(private storeService: StoreService, private fb: FormBuilder) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      storeCode: ['', Validators.required],
      line1: ['', Validators.required],
      area: ['', Validators.required],
      city: ['', Validators.required],
      pincode: ['', Validators.required],
      state: ['', Validators.required],
      status: ['ACTIVE']
    });
  }

  ngOnInit(): void {
    this.loadStores();
  }

  loadStores() {
    this.storeService.getAllStores().subscribe({
      next: (res: any) => {
        const stores = res.data || [];
        this.activeStores = stores.filter((s: any) => s.status === 'ACTIVE');
        this.inactiveStores = stores.filter((s: any) => s.status === 'INACTIVE');
        this.maintenanceStores = stores.filter((s: any) => s.status === 'MAINTENANCE');
      },
      error: (err) => console.error(err)
    });
  }

  openEdit(store: any) {
    this.currentEditingStoreId = store._id;
    this.editForm.patchValue({
      name: store.name,
      storeCode: store.storeCode,
      line1: store.address?.line1 || '',
      area: store.address?.area || '',
      city: store.address?.city || '',
      pincode: store.address?.pincode || '',
      state: store.address?.state || '',
      status: store.status
    });

    this.modalInstance = new bootstrap.Modal(this.editModalRef.nativeElement);
    this.modalInstance.show();
  }

  updateStore() {
    if (!this.currentEditingStoreId || this.editForm.invalid) return;

    const payload = {
      name: this.editForm.value.name,
      storeCode: this.editForm.value.storeCode,
      address: {
        line1: this.editForm.value.line1,
        area: this.editForm.value.area,
        city: this.editForm.value.city,
        pincode: this.editForm.value.pincode,
        state: this.editForm.value.state
      },
      status: this.editForm.value.status
    };

    this.storeService.updateStore(this.currentEditingStoreId, payload).subscribe({
      next: () => {
        this.modalInstance.hide();
        this.loadStores();
      },
      error: (err) => console.error(err)
    });
  }

  deleteStore(id: string) {
    if (!confirm('Are you sure you want to delete this store?')) return;
    this.storeService.deleteStore(id).subscribe({
      next: () => this.loadStores(),
      error: (err) => console.error(err)
    });
  }

  maintenance(id: string) {
    this.storeService.setMaintenance(id).subscribe({
      next: () => this.loadStores(),
      error: (err) => console.error(err)
    });
  }

  formatAddress(store: any): string {
    if (!store.address) return '';
    const { line1, area, city, pincode, state } = store.address;
    return `${line1}, ${area}, ${city} - ${pincode}, ${state}`;
  }

  getWorkingHours(store: any): string {
    const open = store.workingHours?.open || '08:00';
    const close = store.workingHours?.close || '23:00';
    return `${open} - ${close}`;
  }
}
