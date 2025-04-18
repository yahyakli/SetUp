import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private theme = new BehaviorSubject<Theme>(this.getCurrentTheme());
  
  theme$ = this.theme.asObservable();

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.applyTheme(this.getCurrentTheme());
  }

  toggleTheme(): void {
    const newTheme = this.theme.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme: Theme): void {
    localStorage.setItem('theme', theme);
    this.theme.next(theme);
    this.applyTheme(theme);
  }

  private getCurrentTheme(): Theme {
    const savedTheme = localStorage.getItem('theme') as Theme;
    
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check user preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(theme: Theme): void {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
} 