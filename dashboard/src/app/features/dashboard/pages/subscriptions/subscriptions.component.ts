import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="p-6"><h1 class="text-2xl font-bold">Subscriptions</h1><p>Subscriptions page content will go here.</p></div>',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent {} 