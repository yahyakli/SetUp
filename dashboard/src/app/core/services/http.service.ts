import { Injectable } from '@angular/core';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private axiosInstance: AxiosInstance;
  private apiUrl = environment.apiUrl;

  constructor(private authService: AuthService) {
    this.axiosInstance = axios.create({
      baseURL: '/api', // Replace with your API base URL
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.authService.getToken();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.authService.logout();
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );
  }

  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(`${this.apiUrl}/${url}`, config);
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(`${this.apiUrl}/${url}`, data, config);
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(`${this.apiUrl}/${url}`, data, config);
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(`${this.apiUrl}/${url}`, config);
  }

  getObservable<T = any>(url: string, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    return new Observable<AxiosResponse<T>>((observer) => {
      this.get<T>(url, config).then(
        (response) => {
          observer.next(response);
          observer.complete();
        },
        (error) => {
          observer.error(error);
          observer.complete();
        }
      );
    });
  }

  postObservable<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    return new Observable<AxiosResponse<T>>((observer) => {
      this.post<T>(url, data, config).then(
        (response) => {
          observer.next(response);
          observer.complete();
        },
        (error) => {
          observer.error(error);
          observer.complete();
        }
      );
    });
  }

  putObservable<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    return new Observable<AxiosResponse<T>>((observer) => {
      this.put<T>(url, data, config).then(
        (response) => {
          observer.next(response);
          observer.complete();
        },
        (error) => {
          observer.error(error);
          observer.complete();
        }
      );
    });
  }

  deleteObservable<T = any>(url: string, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    return new Observable<AxiosResponse<T>>((observer) => {
      this.delete<T>(url, config).then(
        (response) => {
          observer.next(response);
          observer.complete();
        },
        (error) => {
          observer.error(error);
          observer.complete();
        }
      );
    });
  }
} 