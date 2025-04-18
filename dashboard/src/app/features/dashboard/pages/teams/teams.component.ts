import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="p-6"><h1 class="text-2xl font-bold">Teams</h1><p>Teams page content will go here.</p></div>',
  styleUrls: ['./teams.component.scss']
})
export class TeamsComponent {} 