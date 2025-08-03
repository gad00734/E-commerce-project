import { Component, OnInit } from '@angular/core';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  isAdmin = false;
  showAddUserModal = false;
  newUser: Partial<User> = {
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'user',
    phone: '',
    address: ''
  };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAdminAccess();
    this.loadUsers();
  }

  checkAdminAccess(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = user?.role === 'admin';
      if (!this.isAdmin) {
        this.router.navigate(['/']);
      }
    });
  }

  loadUsers(): void {
    this.userService.users$.subscribe(users => {
      this.users = users;
    });
  }

  getFullName(user: User): string {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName} ${lastName}`.trim() || user.username;
  }

  getRoleDisplay(role: string): string {
    return role === 'admin' ? 'Administrator' : 'Customer';
  }

  getRoleBadgeClass(role: string): string {
    return role === 'admin' ? 'bg-danger' : 'bg-primary';
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId);
    }
  }

  toggleUserRole(user: User): void {
    this.userService.toggleUserRole(user.id);
  }

  openAddUserModal(): void {
    this.showAddUserModal = true;
    this.newUser = {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'user',
      phone: '',
      address: ''
    };
  }

  closeAddUserModal(): void {
    this.showAddUserModal = false;
  }

  addUser(): void {
    if (this.validateUserData()) {
      this.userService.addUser(this.newUser as Omit<User, 'id' | 'createdAt'>);
      this.closeAddUserModal();
    }
  }

  private validateUserData(): boolean {
    if (!this.newUser.username || !this.newUser.email || !this.newUser.password) {
      alert('Please fill in all required fields (Username, Email, Password)');
      return false;
    }
    return true;
  }

  getUsersCount(): number {
    return this.userService.getUsersCount();
  }

  getAdminsCount(): number {
    return this.userService.getAdminsCount();
  }

  getCustomersCount(): number {
    return this.userService.getCustomersCount();
  }
} 