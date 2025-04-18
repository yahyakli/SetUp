import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { UsersComponent } from './pages/users/users.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { TeamsComponent } from './pages/teams/teams.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { SubscriptionsComponent } from './pages/subscriptions/subscriptions.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { ChatComponent } from './pages/chat/chat.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent },
      { path: 'users', component: UsersComponent },
      { path: 'projects', component: ProjectsComponent },
      { path: 'teams', component: TeamsComponent },
      { path: 'tasks', component: TasksComponent },
      { path: 'subscriptions', component: SubscriptionsComponent },
      { path: 'invoices', component: InvoicesComponent },
      { path: 'chat', component: ChatComponent }
    ]
  }
]; 