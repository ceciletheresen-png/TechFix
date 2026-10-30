import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <app-empty-state
        icon="info"
        title="Page not found"
        message="The page you are looking for does not exist or has moved."
      >
        <a routerLink="/" class="btn-primary">Go to the homepage</a>
        <a routerLink="/guides" class="btn-secondary">Browse problems</a>
      </app-empty-state>
    </div>
  `,
})
export class NotFoundComponent {}
