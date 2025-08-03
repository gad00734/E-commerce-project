import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor() {
    this.loadUsers();
  }

  private loadUsers(): void {
    const usersData = localStorage.getItem('users');
    if (usersData) {
      const users = JSON.parse(usersData);
      // Ensure role is properly typed
      const typedUsers: User[] = users.map((user: any) => ({
        ...user,
        role: user.role === 'admin' ? 'admin' : 'user'
      }));
      this.usersSubject.next(typedUsers);
    } else {
      // Initialize with default admin user
      const defaultUsers: User[] = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          password: 'admin123',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          phone: '+1234567890',
          address: 'Admin Address',
          createdAt: new Date().toISOString()
        }
      ];
      this.usersSubject.next(defaultUsers);
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
  }

  getUsers(): User[] {
    return this.usersSubject.value;
  }

  getUserById(id: string): User | undefined {
    return this.usersSubject.value.find(user => user.id === id);
  }

  addUser(user: Omit<User, 'id' | 'createdAt'>): void {
    const newUser: User = {
      ...user,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      role: user.role === 'admin' ? 'admin' : 'user'
    };

    const users = [...this.usersSubject.value, newUser];
    this.usersSubject.next(users);
    localStorage.setItem('users', JSON.stringify(users));
  }

  updateUser(id: string, updates: Partial<User>): void {
    const users = this.usersSubject.value.map(user => {
      if (user.id === id) {
        const updatedUser = { ...user, ...updates };
        // Ensure role is properly typed
        if (updates.role) {
          const newRole: 'user' | 'admin' = updates.role === 'admin' ? 'admin' : 'user';
          updatedUser.role = newRole;
        }
        return updatedUser;
      }
      return user;
    });
    this.usersSubject.next(users);
    localStorage.setItem('users', JSON.stringify(users));
  }

  deleteUser(id: string): void {
    const users = this.usersSubject.value.filter(user => user.id !== id);
    this.usersSubject.next(users);
    localStorage.setItem('users', JSON.stringify(users));
  }

  toggleUserRole(userId: string): void {
    const users = this.usersSubject.value.map(user => {
      if (user.id === userId) {
        const newRole: 'user' | 'admin' = user.role === 'admin' ? 'user' : 'admin';
        return { ...user, role: newRole };
      }
      return user;
    });
    this.usersSubject.next(users);
    localStorage.setItem('users', JSON.stringify(users));
  }

  getUsersCount(): number {
    return this.usersSubject.value.length;
  }

  getAdminsCount(): number {
    return this.usersSubject.value.filter(user => user.role === 'admin').length;
  }

  getCustomersCount(): number {
    return this.usersSubject.value.filter(user => user.role === 'user').length;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
} 