import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { ThemeService } from '../../../../core/services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent implements OnInit {
  isSidebarOpen = true;
  theme$: Observable<'light' | 'dark'>;
  
  constructor(private themeService: ThemeService) {
    this.theme$ = this.themeService.theme$;
  }
  
  ngOnInit(): void {
    // Check screen size on init
    this.checkScreenSize();
    
    // Listen for window resize events
    window.addEventListener('resize', () => {
      this.checkScreenSize();
    });
  }
  
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
  
  private checkScreenSize(): void {
    this.isSidebarOpen = window.innerWidth >= 1024; // lg breakpoint
  }
} 