import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { APP_CONSTANTS } from '../../constants';
import { Project, Team, Task, Comment, Attachment, ChatRoom, Message } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private baseUrl = APP_CONSTANTS.PROJECT_SERVICE_URL;

  constructor(private httpService: HttpService) {}

  // Project endpoints
  getAllProjects(): Observable<Project[]> {
    return this.httpService.get<Project[]>(`${this.baseUrl}/projects`);
  }

  getProjectById(projectId: number): Observable<Project> {
    return this.httpService.get<Project>(`${this.baseUrl}/api/projects/${projectId}`);
  }

  createProject(projectData: Partial<Project>): Observable<Project> {
    return this.httpService.post<Project>(`${this.baseUrl}/projects`, projectData);
  }

  updateProject(projectId: number, projectData: Partial<Project>): Observable<Project> {
    return this.httpService.put<Project>(`${this.baseUrl}/projects/${projectId}`, projectData);
  }

  deleteProject(projectId: number): Observable<any> {
    return this.httpService.delete(`${this.baseUrl}/projects/${projectId}`);
  }

  // Team endpoints
  getAllTeams(): Observable<Team[]> {
    return this.httpService.get<Team[]>(`${this.baseUrl}/teams`);
  }

  getTeamById(teamId: number): Observable<Team> {
    return this.httpService.get<Team>(`${this.baseUrl}/teams/${teamId}`);
  }

  createTeam(teamData: Partial<Team>): Observable<Team> {
    return this.httpService.post<Team>(`${this.baseUrl}/teams`, teamData);
  }

  updateTeam(teamId: number, teamData: Partial<Team>): Observable<Team> {
    return this.httpService.put<Team>(`${this.baseUrl}/teams/${teamId}`, teamData);
  }

  deleteTeam(teamId: number): Observable<any> {
    return this.httpService.delete(`${this.baseUrl}/teams/${teamId}`);
  }

  addTeamMember(teamId: number, userId: string, role: string): Observable<any> {
    return this.httpService.post(`${this.baseUrl}/teams/${teamId}/members`, { userId, role });
  }

  removeTeamMember(teamId: number, userId: string): Observable<any> {
    return this.httpService.delete(`${this.baseUrl}/teams/${teamId}/members/${userId}`);
  }

  // Task endpoints
  getTasksByProject(projectId: number): Observable<Task[]> {
    return this.httpService.get<Task[]>(`${this.baseUrl}/projects/${projectId}/tasks`);
  }

  getTaskById(taskId: string): Observable<Task> {
    return this.httpService.get<Task>(`${this.baseUrl}/tasks/${taskId}`);
  }

  createTask(taskData: Partial<Task>): Observable<Task> {
    return this.httpService.post<Task>(`${this.baseUrl}/tasks`, taskData);
  }

  updateTask(taskId: string, taskData: Partial<Task>): Observable<Task> {
    return this.httpService.put<Task>(`${this.baseUrl}/tasks/${taskId}`, taskData);
  }

  deleteTask(taskId: string): Observable<any> {
    return this.httpService.delete(`${this.baseUrl}/tasks/${taskId}`);
  }

  // Comment endpoints
  getTaskComments(taskId: string): Observable<Comment[]> {
    return this.httpService.get<Comment[]>(`${this.baseUrl}/tasks/${taskId}/comments`);
  }

  addComment(taskId: string, comment: string): Observable<Comment> {
    return this.httpService.post<Comment>(`${this.baseUrl}/tasks/${taskId}/comments`, { comment });
  }

  // Attachment endpoints
  uploadAttachment(taskId: string, file: File): Observable<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    
    // For file uploads, we need to handle the headers differently
    return this.httpService.post<Attachment>(`${this.baseUrl}/tasks/${taskId}/attachments`, formData);
  }

  deleteAttachment(taskId: string, attachmentId: string): Observable<any> {
    return this.httpService.delete(`${this.baseUrl}/tasks/${taskId}/attachments/${attachmentId}`);
  }

  // Chat endpoints
  getChatRooms(): Observable<ChatRoom[]> {
    return this.httpService.get<ChatRoom[]>(`${this.baseUrl}/chat/rooms`);
  }

  getChatRoomById(roomId: string): Observable<ChatRoom> {
    return this.httpService.get<ChatRoom>(`${this.baseUrl}/chat/rooms/${roomId}`);
  }

  createChatRoom(roomData: Partial<ChatRoom>): Observable<ChatRoom> {
    return this.httpService.post<ChatRoom>(`${this.baseUrl}/chat/rooms`, roomData);
  }

  getMessages(roomId: string, limit: number = 50, before?: string): Observable<Message[]> {
    let params: any = { limit };
    if (before) {
      params.before = before;
    }
    return this.httpService.get<Message[]>(`${this.baseUrl}/chat/rooms/${roomId}/messages`, params);
  }

  sendMessage(roomId: string, content: string, parentMessageId?: string): Observable<Message> {
    return this.httpService.post<Message>(`${this.baseUrl}/chat/rooms/${roomId}/messages`, {
      content,
      parentMessageId,
      contentType: 'text'
    });
  }

  sendFileMessage(roomId: string, file: File): Observable<Message> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('contentType', 'file');
    
    return this.httpService.post<Message>(`${this.baseUrl}/chat/rooms/${roomId}/messages`, formData);
  }

  markMessagesAsRead(roomId: string, messageIds: string[]): Observable<any> {
    return this.httpService.post(`${this.baseUrl}/chat/rooms/${roomId}/read`, { messageIds });
  }
} 