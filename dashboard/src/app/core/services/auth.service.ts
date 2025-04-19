import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, of } from 'rxjs';
import { APP_CONSTANTS } from '../../constants';
import { User, AuthState } from '../../types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.USER_SERVICE_URL;
  private authState = new BehaviorSubject<AuthState>({
    token: localStorage.getItem(APP_CONSTANTS.TOKEN_KEY),
    user: JSON.parse(localStorage.getItem(APP_CONSTANTS.USER_KEY) || 'null'),
    isAuthenticated: !!localStorage.getItem(APP_CONSTANTS.TOKEN_KEY)
  });

  public authState$ = this.authState.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string, rememberMe: boolean): Observable<any> {
    return this.http.post<{token: string, user: User}>(`${this.baseUrl}/auth/login`, { email, password, rememberMe })
      .pipe(
        tap(response => {
          this.setSession(response.token, response.user);
        })
      );
  }

  register(userData: Partial<User>): Observable<any> {
    return this.http.post<{token: string, user: User}>(`${this.baseUrl}/auth/register`, userData)
      .pipe(
        tap(response => {
          this.setSession(response.token, response.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(APP_CONSTANTS.TOKEN_KEY);
    localStorage.removeItem(APP_CONSTANTS.USER_KEY);
    this.authState.next({
      token: null,
      user: null,
      isAuthenticated: false
    });
  }

  refreshToken(): Observable<{token: string}> {
    return this.http.post<{token: string}>(`${this.baseUrl}/auth/refresh-token`, {})
      .pipe(
        tap(response => {
          localStorage.setItem(APP_CONSTANTS.TOKEN_KEY, response.token);
          const currentState = this.authState.value;
          this.authState.next({
            ...currentState,
            token: response.token
          });
        })
      );
  }

  getCurrentUser(): Observable<User> {
    // If we already have the user in state, return it
    if (this.authState.value.user) {
      return of(this.authState.value.user);
    }
    
    // Otherwise fetch from API
    return this.http.get<User>(`${this.baseUrl}/users/me`)
      .pipe(
        tap(user => {
          localStorage.setItem(APP_CONSTANTS.USER_KEY, JSON.stringify(user));
          const currentState = this.authState.value;
          this.authState.next({
            ...currentState,
            user
          });
        })
      );
  }

  isAuthenticated(): boolean {
    return this.authState.value.isAuthenticated;
  }

  getToken(): string | null {
    return localStorage.getItem(APP_CONSTANTS.TOKEN_KEY);
  }

  private setSession(token: string, user: User): void {
    localStorage.setItem(APP_CONSTANTS.TOKEN_KEY, token);
    localStorage.setItem(APP_CONSTANTS.USER_KEY, JSON.stringify(user));
    this.authState.next({
      token,
      user,
      isAuthenticated: true
    });
  }
} 