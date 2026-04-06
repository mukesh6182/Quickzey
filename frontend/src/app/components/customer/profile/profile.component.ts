import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';

declare var bootstrap: any;

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = { name: '', email: '', phone: '', status: '', role: '' };
  editData: any = { name: '', phone: '' }; // Temporary storage for modal
  loading = true;
  message = '';

  constructor(
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.fetchProfile();
    }
  }

  fetchProfile() {
    this.loading = true;
    this.userService.getProfile().subscribe({
      next: (res) => {
        this.user = res.user;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  openEditModal() {
    // Clone data so we don't edit the background view directly
    this.editData = { name: this.user.name, phone: this.user.phone };
    this.message = '';
    
    const modalEl = document.getElementById('updateProfileModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  saveProfile() {
    this.userService.updateProfile(this.editData).subscribe({
      next: (res) => {
        // Update the main view with new data
        this.user.name = this.editData.name;
        this.user.phone = this.editData.phone;
        
        // Close modal
        const modalEl = document.getElementById('updateProfileModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();
        
        this.message = 'Profile updated successfully!';
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        this.message = err.error.message || 'Update failed';
      }
    });
  }
}