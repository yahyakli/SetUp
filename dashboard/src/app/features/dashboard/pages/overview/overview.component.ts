import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  stats = [
    { 
      title: 'Total Projects', 
      value: 24, 
      change: '+12%', 
      isPositive: true,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>`
    },
    { 
      title: 'Active Users', 
      value: 142, 
      change: '+18%', 
      isPositive: true,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>`
    },
    { 
      title: 'Tasks Completed', 
      value: 87, 
      change: '+5%', 
      isPositive: true,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>`
    },
    { 
      title: 'Revenue', 
      value: '$12,500', 
      change: '-3%', 
      isPositive: false,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>`
    }
  ];
  
  recentProjects = [
    { 
      name: 'Website Redesign', 
      progress: 75, 
      status: 'In Progress', 
      team: ['John D.', 'Sarah M.', 'Alex K.'],
      deadline: '2023-12-15'
    },
    { 
      name: 'Mobile App Development', 
      progress: 40, 
      status: 'In Progress', 
      team: ['Mike T.', 'Lisa R.'],
      deadline: '2024-01-20'
    },
    { 
      name: 'Marketing Campaign', 
      progress: 90, 
      status: 'Almost Done', 
      team: ['Emma S.', 'David L.', 'Robert J.'],
      deadline: '2023-11-30'
    },
    { 
      name: 'Database Migration', 
      progress: 20, 
      status: 'Just Started', 
      team: ['Chris P.', 'Anna B.'],
      deadline: '2024-02-10'
    }
  ];
  
  recentActivities = [
    {
      user: 'John Doe',
      action: 'completed task',
      target: 'Design Homepage Mockup',
      time: '10 minutes ago',
      avatar: 'JD'
    },
    {
      user: 'Sarah Miller',
      action: 'commented on',
      target: 'API Integration Issue',
      time: '1 hour ago',
      avatar: 'SM'
    },
    {
      user: 'Alex Kim',
      action: 'created project',
      target: 'Mobile App Redesign',
      time: '3 hours ago',
      avatar: 'AK'
    },
    {
      user: 'Lisa Rodriguez',
      action: 'completed task',
      target: 'User Authentication Flow',
      time: '5 hours ago',
      avatar: 'LR'
    },
    {
      user: 'Mike Thompson',
      action: 'updated',
      target: 'Project Timeline',
      time: 'Yesterday',
      avatar: 'MT'
    }
  ];
  
  // Chart data (we'll use simple data for now)
  projectsChartData = {
    completed: 18,
    inProgress: 7,
    notStarted: 5
  };
  
  tasksChartData = {
    completed: 87,
    inProgress: 34,
    blocked: 12,
    backlog: 45
  };
  
  constructor() { }
  
  ngOnInit(): void {
    // In a real app, you would fetch data from a service here
  }
  
  getProgressColorClass(progress: number): string {
    if (progress < 25) return 'bg-red-500';
    if (progress < 50) return 'bg-yellow-500';
    if (progress < 75) return 'bg-blue-500';
    return 'bg-green-500';
  }
} 