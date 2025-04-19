import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // Define your routes here
  // Example:
  // { path: 'dashboard', loadComponent: () => import('./features/dashboard/pages/overview/overview.component').then(m => m.OverviewComponent) },
  // { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 