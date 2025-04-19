import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { APP_CONSTANTS } from '../../constants';
import { Plan, Subscription, Invoice, userPermissions } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private baseUrl = APP_CONSTANTS.BILLING_SERVICE_URL;

  constructor(private httpService: HttpService) {}

  // Plan endpoints
  getAvailablePlans(): Observable<Plan[]> {
    return this.httpService.get<Plan[]>(`${this.baseUrl}/plans`);
  }

  getPlanById(planId: number): Observable<Plan> {
    return this.httpService.get<Plan>(`${this.baseUrl}/plans/${planId}`);
  }

  // Subscription endpoints
  getCurrentSubscription(): Observable<Subscription> {
    return this.httpService.get<Subscription>(`${this.baseUrl}/subscriptions/current`);
  }

  createSubscription(planId: number, paymentMethodId: string): Observable<Subscription> {
    return this.httpService.post<Subscription>(`${this.baseUrl}/subscriptions`, {
      planId,
      paymentMethodId,
      autoRenew: true
    });
  }

  updateSubscription(subscriptionId: number, data: Partial<Subscription>): Observable<Subscription> {
    return this.httpService.put<Subscription>(`${this.baseUrl}/subscriptions/${subscriptionId}`, data);
  }

  cancelSubscription(subscriptionId: number): Observable<Subscription> {
    return this.httpService.post<Subscription>(`${this.baseUrl}/subscriptions/${subscriptionId}/cancel`, {});
  }

  // Invoice endpoints
  getInvoices(): Observable<Invoice[]> {
    return this.httpService.get<Invoice[]>(`${this.baseUrl}/invoices`);
  }

  getInvoiceById(invoiceId: number): Observable<Invoice> {
    return this.httpService.get<Invoice>(`${this.baseUrl}/invoices/${invoiceId}`);
  }

  downloadInvoice(invoiceId: number): Observable<Blob> {
    return this.httpService.get<Blob>(`${this.baseUrl}/invoices/${invoiceId}/download`);
  }

  // Payment methods
  addPaymentMethod(paymentMethodId: string): Observable<any> {
    return this.httpService.post(`${this.baseUrl}/payment-methods`, { paymentMethodId });
  }

  getPaymentMethods(): Observable<any[]> {
    return this.httpService.get<any[]>(`${this.baseUrl}/payment-methods`);
  }

  deletePaymentMethod(paymentMethodId: string): Observable<any> {
    return this.httpService.delete(`${this.baseUrl}/payment-methods/${paymentMethodId}`);
  }

  setDefaultPaymentMethod(paymentMethodId: string): Observable<any> {
    return this.httpService.post(`${this.baseUrl}/payment-methods/${paymentMethodId}/default`, {});
  }

  // User permissions based on subscription
  getUserPermissions(): Observable<userPermissions> {
    return this.httpService.get<userPermissions>(`${this.baseUrl}/permissions`);
  }
} 