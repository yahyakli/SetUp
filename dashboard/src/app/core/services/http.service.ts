import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONSTANTS } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private getHeaders(contentType: string = 'application/json'): HttpHeaders {
    const token = localStorage.getItem(APP_CONSTANTS.TOKEN_KEY);
    let headers = new HttpHeaders();
    
    if (contentType) {
      headers = headers.set('Content-Type', contentType);
    }
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  constructor(private http: HttpClient) {}

  get<T>(url: string, params = {}): Observable<T> {
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      params
    });
  }

  post<T>(url: string, body: any, contentType: string = 'application/json'): Observable<T> {
    // Handle FormData differently (don't set content-type as browser will set it with boundary)
    if (body instanceof FormData) {
      const headers = this.getHeaders(null);
      return this.http.post<T>(url, body, { headers });
    }
    
    return this.http.post<T>(url, body, {
      headers: this.getHeaders(contentType)
    });
  }

  put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(url, body, {
      headers: this.getHeaders()
    });
  }

  patch<T>(url: string, body: any): Observable<T> {
    return this.http.patch<T>(url, body, {
      headers: this.getHeaders()
    });
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url, {
      headers: this.getHeaders()
    });
  }
} 