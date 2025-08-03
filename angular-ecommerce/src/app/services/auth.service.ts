import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const user = JSON.parse(userData);
      // Ensure role is properly typed
      const typedUser: User = {
        ...user,
        role: user.role === 'admin' ? 'admin' : 'user'
      };
      this.currentUserSubject.next(typedUser);
    }
  }

  login(email: string, password: string): Observable<User | null> {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      return of(user);
    } else {
      return of(null);
    }
  }

  register(userData: any): Observable<User | null> {
    const users = this.getUsers();
    
    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
      return of(null);
    }

    const newUser: User = {
      id: this.generateId(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      phone: userData.phone || '',
      address: userData.address || '',
      role: userData.role || 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto-login after registration
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    this.currentUserSubject.next(newUser);
    
    return of(newUser);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'admin';
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private getUsers(): User[] {
    const usersData = localStorage.getItem('users');
    if (usersData) {
      const users = JSON.parse(usersData);
      // Ensure role is properly typed
      return users.map((user: any) => ({
        ...user,
        role: user.role === 'admin' ? 'admin' : 'user'
      }));
    }
    
    // Return default users if none exist
    const defaultUsers: User[] = [
      {
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        phone: '1234567890',
        address: 'Admin Address',
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        firstName: 'John',
        lastName: 'Doe',
        username: 'john',
        email: 'john@example.com',
        password: 'password123',
        phone: '0987654321',
        address: 'User Address',
        role: 'user',
        createdAt: new Date().toISOString()
      }
    ];
    
    localStorage.setItem('users', JSON.stringify(defaultUsers));
    return defaultUsers;
  }

  private generateId(): string {
    return Date.now().toString();
  }
} 