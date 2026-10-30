import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../core/models';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-category-card',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a [routerLink]="['/categories', category().slug]" class="card-link h-full">
      <span class="mb-3 inline-flex rounded-lg bg-brand-50 p-2.5 text-brand-700"
        ><app-icon [name]="category().icon" [size]="24"
      /></span>
      <h3 class="font-semibold">{{ category().name }}</h3>
      <p class="mt-1 text-sm text-slate-600">{{ category().description }}</p>
      <p class="mt-3 text-xs font-medium text-brand-700">
        {{ count() }} {{ count() === 1 ? 'guide' : 'guides' }}
      </p>
    </a>
  `,
})
export class CategoryCardComponent {
  readonly category = input.required<Category>();
  readonly count = input(0);
}
