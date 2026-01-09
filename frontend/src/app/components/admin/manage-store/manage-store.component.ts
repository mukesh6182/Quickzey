import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../../services/store.service';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

declare var bootstrap: any; // Use Bootstrap JS globally

@Component({
  selector: 'app-manage-store',
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
  templateUrl: './manage-store.component.html',
  styleUrls: ['./manage-store.component.css']
})
export class ManageStoreComponent implements OnInit, AfterViewInit {
  activeStores: any[] = [];
  inactiveStores: any[] = [];
  maintenanceStores: any[] = [];

  activeDS = new MatTableDataSource<any>([]);
  inactiveDS = new MatTableDataSource<any>([]);
  maintenanceDS = new MatTableDataSource<any>([]);

  displayedColumns: string[] = ['name', 'code', 'address', 'workingHours', 'actions'];

  pageSizeOptions = [5, 10, 25, 50];
  pageSize = 10;

  @ViewChild('activePaginator') activePaginator!: MatPaginator;
  @ViewChild('activeSort') activeSort!: MatSort;

  @ViewChild('inactivePaginator') inactivePaginator!: MatPaginator;
  @ViewChild('inactiveSort') inactiveSort!: MatSort;

  @ViewChild('maintenancePaginator') maintenancePaginator!: MatPaginator;
  @ViewChild('maintenanceSort') maintenanceSort!: MatSort;

  editForm!: FormGroup;
  @ViewChild('editModal') editModalRef!: ElementRef;
  modalInstance: any;

  currentEditingStoreId: string | null = null;

  constructor(private storeService: StoreService, private fb: FormBuilder) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      storeCode: [{ value: '', disabled: true }],
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

  ngAfterViewInit() {
    this.activeDS.paginator = this.activePaginator;
    this.activeDS.sort = this.activeSort;

    this.inactiveDS.paginator = this.inactivePaginator;
    this.inactiveDS.sort = this.inactiveSort;

    this.maintenanceDS.paginator = this.maintenancePaginator;
    this.maintenanceDS.sort = this.maintenanceSort;
  }

  loadStores() {
    this.storeService.getAllStores().subscribe({
      next: (res: any) => {
        const stores = res.data || [];
        this.activeStores = stores.filter((s: any) => s.status === 'ACTIVE');
        this.inactiveStores = stores.filter((s: any) => s.status === 'INACTIVE');
        this.maintenanceStores = stores.filter((s: any) => s.status === 'MAINTENANCE');

        this.activeDS.data = this.activeStores;
        this.inactiveDS.data = this.inactiveStores;
        this.maintenanceDS.data = this.maintenanceStores;
      },
      error: (err) => console.error(err)
    });
  }

  applyFilter(event: Event, type: 'active' | 'inactive' | 'maintenance') {
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
      case 'maintenance':
        this.maintenanceDS.filter = filterValue;
        if (this.maintenanceDS.paginator) {
          this.maintenanceDS.paginator.firstPage();
        }
        break;
    }
  }

  changePageSize(size: number, type: 'active' | 'inactive' | 'maintenance') {
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
      case 'maintenance':
        if (this.maintenancePaginator) {
          this.maintenancePaginator._changePageSize(size);
        }
        break;
    }
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
