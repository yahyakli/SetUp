import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastActive: string;
  avatar: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Admin',
      status: 'active',
      lastActive: '2023-11-15T14:30:00',
      avatar: 'JD'
    },
    {
      id: 2,
      name: 'Sarah Miller',
      email: 'sarah.miller@example.com',
      role: 'Project Manager',
      status: 'active',
      lastActive: '2023-11-15T10:15:00',
      avatar: 'SM'
    },
    {
      id: 3,
      name: 'Alex Kim',
      email: 'alex.kim@example.com',
      role: 'Developer',
      status: 'active',
      lastActive: '2023-11-14T16:45:00',
      avatar: 'AK'
    },
    {
      id: 4,
      name: 'Lisa Rodriguez',
      email: 'lisa.rodriguez@example.com',
      role: 'Designer',
      status: 'active',
      lastActive: '2023-11-13T09:20:00',
      avatar: 'LR'
    },
    {
      id: 5,
      name: 'Mike Thompson',
      email: 'mike.thompson@example.com',
      role: 'Developer',
      status: 'inactive',
      lastActive: '2023-11-10T11:30:00',
      avatar: 'MT'
    },
    {
      id: 6,
      name: 'Emma Smith',
      email: 'emma.smith@example.com',
      role: 'QA Engineer',
      status: 'active',
      lastActive: '2023-11-15T08:45:00',
      avatar: 'ES'
    },
    {
      id: 7,
      name: 'David Lee',
      email: 'david.lee@example.com',
      role: 'Developer',
      status: 'active',
      lastActive: '2023-11-14T13:15:00',
      avatar: 'DL'
    },
    {
      id: 8,
      name: 'Robert Johnson',
      email: 'robert.johnson@example.com',
      role: 'Marketing',
      status: 'inactive',
      lastActive: '2023-11-08T15:30:00',
      avatar: 'RJ'
    }
  ];
  
  filteredUsers: User[] = [];
  searchTerm: string = '';
  selectedRole: string = '';
  selectedStatus: string = '';
  
  roles: string[] = ['Admin', 'Project Manager', 'Developer', 'Designer', 'QA Engineer', 'Marketing'];
  
  constructor() { }
  
  ngOnInit(): void {
    this.filteredUsers = [...this.users];
  }
  
  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      // Search term filter
      const matchesSearch = !this.searchTerm || 
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Role filter
      const matchesRole = !this.selectedRole || user.role === this.selectedRole;
      
      // Status filter
      const matchesStatus = !this.selectedStatus || 
        (this.selectedStatus === 'active' && user.status === 'active') ||
        (this.selectedStatus === 'inactive' && user.status === 'inactive');
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }
  
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.filteredUsers = [...this.users];
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
} 