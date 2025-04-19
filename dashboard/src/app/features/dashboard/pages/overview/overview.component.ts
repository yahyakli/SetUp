import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { ProjectService } from '../../../../core/services/project.service';
import { BillingService } from '../../../../core/services/billing.service';
import { User, Project, Task, Subscription, Plan, Team } from '../../../../types';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  currentUser: User | null = null;
  projects: Project[] = [];
  teams: Team[] = [];
  recentTasks: Task[] = [];
  subscription: Subscription | null = null;
  currentPlan: Plan | null = null;
  loading = true;
  error: string | null = null;

  stats = [
    {
      title: 'Users',
      value: 142,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>`
    },
    {
      title: 'Projects',
      value: 24,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>`
    },
    {
      title: 'Teams',
      value: 87,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>`
    },
    {
      title: 'Revenue',
      value: '$12,500',
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

  constructor(
    private userService: UserService,
    private projectService: ProjectService,
    private billingService: BillingService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    // Use forkJoin to make parallel requests
    forkJoin({
      projects: this.projectService.getAllProjects(),
      teams: this.projectService.getAllTeams(),
      subscription: this.billingService.getCurrentSubscription()
    }).subscribe({
      next: (results) => {
        this.projects = results.projects;
        this.teams = results.teams;
        this.subscription = results.subscription;
        
        if (this.subscription && this.subscription.plan_id) {
          this.loadPlanDetails(this.subscription.plan_id);
        }
        
        // If we have projects, load tasks for the first project
        if (this.projects.length > 0) {
          this.loadRecentTasks(this.projects[0].id);
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
        this.error = 'Failed to load dashboard data. Please try again later.';
        this.loading = false;
      }
    });
  }

  loadPlanDetails(planId: number): void {
    this.billingService.getPlanById(planId).subscribe({
      next: (plan) => {
        this.currentPlan = plan;
      },
      error: (err) => {
        console.error('Error loading plan details', err);
      }
    });
  }

  loadRecentTasks(projectId: number): void {
    this.projectService.getTasksByProject(projectId).subscribe({
      next: (tasks) => {
        // Sort tasks by creation date (newest first) and take the first 5
        this.recentTasks = tasks
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
      },
      error: (err) => {
        console.error('Error loading recent tasks', err);
      }
    });
  }

  // Helper methods for the template
  getProjectStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'on hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getTaskPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  refreshData(): void {
    this.loadDashboardData();
  }
} 