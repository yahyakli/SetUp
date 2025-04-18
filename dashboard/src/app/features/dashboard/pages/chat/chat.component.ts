import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="p-6"><h1 class="text-2xl font-bold">Chat</h1><p>Chat page content will go here.</p></div>',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {} 