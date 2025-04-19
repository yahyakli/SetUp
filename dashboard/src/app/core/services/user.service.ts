import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { APP_CONSTANTS } from '../../constants';
import { User, Invitation } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = APP_CONSTANTS.USER_SERVICE_URL;

  constructor(private httpService: HttpService) {}

  // User endpoints
  getCurrentUser(): Observable<User> {
    return this.httpService.get<User>(`${this.baseUrl}/users/me`);
  }

  getUserById(userId: string): Observable<User> {
    return this.httpService.get<User>(`${this.baseUrl}/users/${userId}`);
  }

  updateUser(userId: string, userData: Partial<User>): Observable<User> {
    return this.httpService.put<User>(`${this.baseUrl}/users/${userId}`, userData);
  }

  searchUsers(query: string): Observable<User[]> {
    return this.httpService.get<User[]>(`${this.baseUrl}/users/search`, { query });
  }

  // Invitation endpoints
  getInvitations(): Observable<Invitation[]> {
    return this.httpService.get<Invitation[]>(`${this.baseUrl}/invitations`);
  }

  sendInvitation(teamId: number, email: string, role: string): Observable<Invitation> {
    return this.httpService.post<Invitation>(`${this.baseUrl}/invitations`, {
      teamId,
      email,
      role
    });
  }

  respondToInvitation(invitationId: string, status: 'accepted' | 'rejected'): Observable<Invitation> {
    return this.httpService.put<Invitation>(`${this.baseUrl}/invitations/${invitationId}`, { status });
  }

  // Notification endpoints
  getNotifications(): Observable<Notification[]> {
    return this.httpService.get<Notification[]>(`${this.baseUrl}/notifications`);
  }

  markNotificationAsRead(notificationId: string): Observable<Notification> {
    return this.httpService.patch<Notification>(`${this.baseUrl}/notifications/${notificationId}`, {
      read: true
    });
  }
} 