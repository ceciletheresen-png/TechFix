import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LoadStatus } from '../../core/models';
import { IconComponent } from './icon.component';

/** Loading and error states for data that comes from the local JSON files. */
@Component({
  selector: 'app-status-message',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (status() === 'error') {
      <div role="alert" class="card flex flex-col items-center px-6 py-10 text-center">
        <app-icon name="warning" [size]="28" />
        <h2 class="mt-2 text-lg font-semibold">We could not load the help content</h2>
        <p class="mt-1 max-w-md text-sm text-slate-600">
          Check your connection and try again. Once the content has loaded, TechFix works offline.
        </p>
        <button type="button" class="btn-primary mt-4" (click)="retry.emit()">Try again</button>
      </div>
    } @else {
      <p role="status" class="card px-6 py-10 text-center text-slate-600">Loading help content…</p>
    }
  `,
})
export class StatusMessageComponent {
  readonly status = input.required<LoadStatus>();
  readonly retry = output<void>();
}
