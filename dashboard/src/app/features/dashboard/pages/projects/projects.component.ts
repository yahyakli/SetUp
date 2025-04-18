import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="p-6"><h1 class="text-2xl font-bold">Projects</h1><p>Projects page content will go here.</p></div>',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {} 