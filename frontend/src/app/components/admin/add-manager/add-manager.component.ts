import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-manager',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './add-manager.component.html',
  styleUrls: ['./add-manager.component.css']
})
export class AddManagerComponent implements OnInit {

  managerForm!: FormGroup;
  isSubmitting = false;
  toastMessage: string | null = null;
  toastType: 'success' | 'danger' = 'success';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.managerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.managerForm.invalid) return;

    this.isSubmitting = true;
    this.toastMessage = null;

    this.userService.addManager(this.managerForm.value).subscribe({
      next: (res: any) => {
        this.toastMessage = res.message || 'Manager added successfully';
        this.toastType = 'success';
        setTimeout(() => {
          this.isSubmitting = false;
          this.router.navigate(['/admin/manage-users']);
        }, 1500);
      },
      error: (err) => {
        this.toastMessage = err.error?.message || 'Failed to add manager';
        this.toastType = 'danger';
        this.isSubmitting = false;
        setTimeout(() => (this.toastMessage = null), 4000);
      }
    });
  }
}
