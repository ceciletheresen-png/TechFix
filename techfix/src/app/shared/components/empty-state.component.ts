import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-empty-state',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card flex flex-col items-center px-6 py-10 text-center">
      <span class="mb-3 rounded-full bg-brand-50 p-3 text-brand-600"
        ><app-icon [name]="icon()" [size]="28"
      /></span>
      <h2 class="text-lg font-semibold">{{ title() }}</h2>
      <p class="mt-1 max-w-md text-sm text-slate-600">{{ message() }}</p>
      <div class="mt-4 flex flex-wrap justify-center gap-2"><ng-content /></div>
    </div>
  `,
})
export class EmptyStateComponent {
  readonly icon = input('search');
  readonly title = input.required<string>();
  readonly message = input('');
}
