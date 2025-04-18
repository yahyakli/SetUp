import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import axios from 'axios';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'setup_auth_token';
  public user: any;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();


  constructor(private cookieService: CookieService) {
    // Initialize authentication state immediately
    this.initAuthState();
    // Configure axios to include the auth token in all requests
    this.setupAxiosInterceptors();
  }

  private initAuthState(): void {
    const isAuthenticated = this.hasToken();
    this.isAuthenticatedSubject.next(isAuthenticated);
    
    // If authenticated, try to load the user data
    if (isAuthenticated) {
      this.getUser().catch(error => console.error('Failed to load user data on init:', error));
    }
  }

  private setupAxiosInterceptors(): void {
    // Add request interceptor to include the token in all requests
    axios.interceptors.request.use(config => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }, error => {
      return Promise.reject(error);
    });

    // Add response interceptor to handle authentication errors
    axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Token might be expired or invalid
          this.logout();
          // You might want to redirect to login page here
        }
        return Promise.reject(error);
      }
    );
  }

  async login(email: string, password: string, rememberMe: boolean): Promise<any> {
    try {
      const response = await axios.post(`${environment.USER_SERVICE_URL}/api/auth/admin/login`, {
        email,
        password,
        rememberMe
      });
      this.setSession(response.data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  logout(): void {
    try {
      this.cookieService.delete(this.TOKEN_KEY);
      this.isAuthenticatedSubject.next(false);
      this.user = null;
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

  async getUser(): Promise<any> {
    try {
      if (!this.isAuthenticated()) {
        return null;
      }
      
      const response = await axios.get(`${environment.USER_SERVICE_URL}/api/users/me`);
      this.user = response.data;
      console.log(this.user);
      return response.data;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  private setSession(authResult: any): void {
    try {
      // Set cookie expiration based on rememberMe
      const expirationDays = authResult.rememberMe ? 30 : 1;
      this.cookieService.set(this.TOKEN_KEY, authResult.token, expirationDays);
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