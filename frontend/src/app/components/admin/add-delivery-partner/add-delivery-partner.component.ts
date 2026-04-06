import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-delivery-partner',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-delivery-partner.component.html',
  styleUrls: ['./add-delivery-partner.component.css']
})
export class AddDeliveryPartnerComponent implements OnInit {

  deliveryForm!: FormGroup;
  isSubmitting = false;
  toastMessage: string | null = null;
  toastType: 'success' | 'danger' = 'success';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.deliveryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      addressLine: ['', [Validators.required]],
      landmark: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.deliveryForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.deliveryForm.invalid) return;

    this.isSubmitting = true;
    this.toastMessage = null;

    const formValue = this.deliveryForm.value;

    const payload = {
      name: formValue.name,
      email: formValue.email,
      phone: formValue.phone,
      password: formValue.password,
      address: {
        addressLine: formValue.addressLine,
        landmark: formValue.landmark,
        city: formValue.city,
        state: formValue.state,
        pincode: formValue.pincode,
        label: 'HOME',
        isDefault: true
      }
    };

    this.userService.addDeliveryPartner(payload).subscribe({
      next: (res: any) => {
        this.toastMessage = res.message || 'Delivery Partner added successfully';
        this.toastType = 'success';
        setTimeout(() => {
          this.isSubmitting = false;
          this.router.navigate(['/admin/manage-users']);
        }, 1500);
      },
      error: (err) => {
        this.toastMessage = err.error?.message || 'Failed to add delivery partner';
        this.toastType = 'danger';
        this.isSubmitting = false;
        setTimeout(() => (this.toastMessage = null), 4000);
      }
    });
  }
}