import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isEditing = false;
  editForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  };
  isLoading = false;
  message = '';
  messageType = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.editForm = {
        firstName: this.user.firstName || '',
        lastName: this.user.lastName || '',
        email: this.user.email,
        phone: this.user.phone || '',
        address: this.user.address || ''
      };
    }
  }

  startEditing(): void {
    this.isEditing = true;
    this.message = '';
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.loadUserProfile();
    this.message = '';
  }

  saveProfile(): void {
    this.isLoading = true;
    this.message = '';

    if (this.user) {
      // Update user profile
      const updatedUser: User = {
        ...this.user,
        firstName: this.editForm.firstName,
        lastName: this.editForm.lastName,
        phone: this.editForm.phone,
        address: this.editForm.address
      };

      // Update in localStorage
      const users = this.getUsers();
      const userIndex = users.findIndex(u => u.id === this.user!.id);
      
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        this.user = updatedUser;
        this.isEditing = false;
        this.message = 'Profile updated successfully!';
        this.messageType = 'success';
      } else {
        this.message = 'Failed to update profile';
        this.messageType = 'error';
      }
    }

    this.isLoading = false;
  }

  private getUsers(): User[] {
    const usersData = localStorage.getItem('users');
    return usersData ? JSON.parse(usersData) : [];
  }

  getFullName(): string {
    if (this.user) {
      const firstName = this.user.firstName || '';
      const lastName = this.user.lastName || '';
      return `${firstName} ${lastName}`.trim() || this.user.username;
    }
    return '';
  }

  getRoleDisplay(): string {
    return this.user?.role === 'admin' ? 'Administrator' : 'Customer';
  }
} 