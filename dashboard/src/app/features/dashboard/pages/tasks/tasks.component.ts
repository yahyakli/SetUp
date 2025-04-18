import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="p-6"><h1 class="text-2xl font-bold">Tasks</h1><p>Tasks page content will go here.</p></div>',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent {} 