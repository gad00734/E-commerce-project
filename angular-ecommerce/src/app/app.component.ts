import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { Observable } from 'rxjs';
import { User } from './models/user.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  currentUser$: Observable<User | null>;
  isLoggedIn$: Observable<boolean>;
  isAdmin$: Observable<boolean>;
  cartCount$: Observable<number>;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.isLoggedIn$ = this.authService.currentUser$.pipe(
      map(user => !!user)
    );
    this.isAdmin$ = this.authService.currentUser$.pipe(
      map(user => user?.role === 'admin')
    );
    this.cartCount$ = this.cartService.cart$.pipe(
      map(items => items.reduce((count, item) => count + item.quantity, 0))
    );
  }

  ngOnInit(): void {
    // Initialize any app-wide functionality
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
} 