import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GuideService } from '../../core/services/guide.service';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs.component';
import { CategoryCardComponent } from '../../shared/components/category-card.component';
import { StatusMessageComponent } from '../../shared/components/status-message.component';

@Component({
  selector: 'app-category-list',
  imports: [BreadcrumbsComponent, CategoryCardComponent, StatusMessageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <app-breadcrumbs [items]="[{ label: 'Home', link: '/' }, { label: 'Categories' }]" />
      <h1 class="text-3xl font-bold">Categories</h1>
      <p class="mt-2 text-slate-600">Choose the kind of device or problem you are dealing with.</p>
      @if (content.status() !== 'ready') {
        <div class="mt-6">
          <app-status-message [status]="content.status()" (retry)="content.load()" />
        </div>
      } @else {
        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (c of content.categories(); track c.id) {
            <app-category-card [category]="c" [count]="content.guidesForCategory(c).length" />
          }
        </div>
      }
    </div>
  `,
})
export class CategoryListComponent {
  protected readonly content = inject(GuideService);
}
