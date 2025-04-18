import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
// import axios from 'axios';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'setup_auth_token';
  private readonly USER_KEY = 'setup_user';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private cookieService: CookieService) {
    setTimeout(() => {
      this.isAuthenticatedSubject.next(this.hasToken());
    }, 0);
  }

  async login(email: string, password: string): Promise<any> {
    // For demo purposes, simulate a successful login
    const mockResponse = {
      token: 'mock-jwt-token',
      user: {
        id: 1,
        name: 'Admin User',
        email: email,
        role: 'admin'
      }
    };
    
    this.setSession(mockResponse);
    return mockResponse;
  }

  logout(): void {
    try {
      this.cookieService.delete(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      this.isAuthenticatedSubject.next(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  isAuthenticated(): boolean {
    try {
      return this.getToken() !== null;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  getToken(): string | null {
    try {
      return this.cookieService.get(this.TOKEN_KEY) || null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  getUser(): any {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  private setSession(authResult: any): void {
    try {
      this.cookieService.set(this.TOKEN_KEY, authResult.token, 30);
      localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.user));
      this.isAuthenticatedSubject.next(true);
    } catch (error) {
      console.error('Error setting session:', error);
    }
  }

  private hasToken(): boolean {
    try {
      return this.getToken() !== null;
    } catch (error) {
      console.error('Error checking token:', error);
      return false;
    }
  }
} 