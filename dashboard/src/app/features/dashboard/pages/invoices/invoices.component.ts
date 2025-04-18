import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="p-6"><h1 class="text-2xl font-bold">Invoices</h1><p>Invoices page content will go here.</p></div>',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent {} 