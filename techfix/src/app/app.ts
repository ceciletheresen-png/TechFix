import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { DiagnosticService } from './core/services/diagnostic.service';
import { GuideService } from './core/services/guide.service';
import { IconComponent } from './shared/components/icon.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  protected readonly menuOpen = signal(false);
  protected readonly year = new Date().getFullYear();
  protected readonly links = [
    { label: 'Home', path: '/', exact: true },
    { label: 'Browse Problems', path: '/guides', exact: false },
    { label: 'Categories', path: '/categories', exact: false },
    { label: 'Bookmarks', path: '/bookmarks', exact: false },
    { label: 'About', path: '/about', exact: false },
  ];

  protected mainFocus(): void {
    document.getElementById('main-content')?.focus();
  }

  constructor() {
    void inject(GuideService).load();
    void inject(DiagnosticService).load();
    // After each navigation, close the mobile menu and move keyboard/screen-reader focus to the page content.
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.menuOpen.set(false);
      document.getElementById('main-content')?.focus({ preventScroll: true });
    });
  }
}
