import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '../../../services/user.service';

declare var bootstrap: any;

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'STORE_MANAGER' | 'CUSTOMER' | 'DELIVERY';
}

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit, AfterViewInit {

  adminsDS = new MatTableDataSource<User>([]);
  managersDS = new MatTableDataSource<User>([]);
  customersDS = new MatTableDataSource<User>([]);
  deliveryDS = new MatTableDataSource<User>([]);

  displayedColumns: string[] = ['name', 'email', 'phone', 'role', 'actions'];

  pageSizeOptions = [5, 10, 25, 50];
  pageSize = 10;

  @ViewChild('adminsPaginator') adminsPaginator!: MatPaginator;
  @ViewChild('adminsSort') adminsSort!: MatSort;

  @ViewChild('managersPaginator') managersPaginator!: MatPaginator;
  @ViewChild('managersSort') managersSort!: MatSort;

  @ViewChild('customersPaginator') customersPaginator!: MatPaginator;
  @ViewChild('customersSort') customersSort!: MatSort;

  @ViewChild('deliveryPaginator') deliveryPaginator!: MatPaginator;
  @ViewChild('deliverySort') deliverySort!: MatSort;

  editForm!: FormGroup;
  @ViewChild('editModal') editModalRef!: ElementRef;
  modalInstance: any;

  currentEditingUserId: string | null = null;

  constructor(private userService: UserService, private fb: FormBuilder) {
    this.editForm = this.fb.group({
      name: [''],
      email: [''],
      phone: ['']
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.adminsDS.paginator = this.adminsPaginator;
    this.adminsDS.sort = this.adminsSort;

    this.managersDS.paginator = this.managersPaginator;
    this.managersDS.sort = this.managersSort;

    this.customersDS.paginator = this.customersPaginator;
    this.customersDS.sort = this.customersSort;

    this.deliveryDS.paginator = this.deliveryPaginator;
    this.deliveryDS.sort = this.deliverySort;
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        const users: User[] = res.data || [];
        this.adminsDS.data = users.filter(u => u.role === 'ADMIN');
        this.managersDS.data = users.filter(u => u.role === 'STORE_MANAGER');
        this.customersDS.data = users.filter(u => u.role === 'CUSTOMER');
        this.deliveryDS.data = users.filter(u => u.role === 'DELIVERY');
      },
      error: (err) => console.error(err)
    });
  }

  applyFilter(event: Event, type: 'admins' | 'managers' | 'customers' | 'delivery') {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    switch (type) {
      case 'admins':
        this.adminsDS.filter = filterValue;
        this.adminsDS.paginator?.firstPage();
        break;
      case 'managers':
        this.managersDS.filter = filterValue;
        this.managersDS.paginator?.firstPage();
        break;
      case 'customers':
        this.customersDS.filter = filterValue;
        this.customersDS.paginator?.firstPage();
        break;
      case 'delivery':
        this.deliveryDS.filter = filterValue;
        this.deliveryDS.paginator?.firstPage();
        break;
    }
  }

  changePageSize(size: number, type: 'admins' | 'managers' | 'customers' | 'delivery') {
    this.pageSize = size;
    switch (type) {
      case 'admins': this.adminsPaginator?._changePageSize(size); break;
      case 'managers': this.managersPaginator?._changePageSize(size); break;
      case 'customers': this.customersPaginator?._changePageSize(size); break;
      case 'delivery': this.deliveryPaginator?._changePageSize(size); break;
    }
  }

  openEdit(user: User) {
    this.currentEditingUserId = user._id;
    this.editForm.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone || ''
    });
    this.modalInstance = new bootstrap.Modal(this.editModalRef.nativeElement);
    this.modalInstance.show();
  }

  updateUser() {
    if (!this.currentEditingUserId) return;
    this.userService.updateUser(this.currentEditingUserId, this.editForm.value).subscribe({
      next: () => {
        this.modalInstance.hide();
        this.loadUsers();
      },
      error: (err) => console.error(err)
    });
  }

  deleteUser(id: string) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.userService.deleteUser(id).subscribe({
      next: () => this.loadUsers(),
      error: (err) => console.error(err)
    });
  }
}
