import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from './icon.component';

export interface Crumb {
  label: string;
  link?: string;
}

@Component({
  selector: 'app-breadcrumbs',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Breadcrumb" class="mb-4 text-sm text-slate-600">
      <ol class="flex flex-wrap items-center gap-1">
        @for (c of items(); track $index; let last = $last) {
          <li class="flex items-center gap-1">
            @if (c.link && !last) {
              <a
                [routerLink]="c.link"
                class="rounded underline-offset-2 hover:text-brand-700 hover:underline"
                >{{ c.label }}</a
              >
              <app-icon name="chevron-right" [size]="14" />
            } @else {
              <span [attr.aria-current]="last ? 'page' : null" class="font-medium text-slate-900">{{
                c.label
              }}</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class BreadcrumbsComponent {
  readonly items = input.required<Crumb[]>();
}
