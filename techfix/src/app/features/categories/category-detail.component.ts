import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DIFFICULTIES, Difficulty } from '../../core/models';
import { DiagnosticService } from '../../core/services/diagnostic.service';
import { GuideService } from '../../core/services/guide.service';
import { SearchService } from '../../core/services/search.service';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { GuideCardComponent } from '../../shared/components/guide-card.component';
import { IconComponent } from '../../shared/components/icon.component';
import { StatusMessageComponent } from '../../shared/components/status-message.component';

@Component({
  selector: 'app-category-detail',
  imports: [
    RouterLink,
    BreadcrumbsComponent,
    EmptyStateComponent,
    GuideCardComponent,
    IconComponent,
    StatusMessageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      @if (content.status() !== 'ready') {
        <app-status-message [status]="content.status()" (retry)="content.load()" />
      } @else if (category(); as cat) {
        <app-breadcrumbs
          [items]="[
            { label: 'Home', link: '/' },
            { label: 'Categories', link: '/categories' },
            { label: cat.name },
          ]"
        />
        <div class="flex items-start gap-4">
          <span class="rounded-xl bg-brand-50 p-3 text-brand-700"
            ><app-icon [name]="cat.icon" [size]="32"
          /></span>
          <div>
            <h1 class="text-3xl font-bold">{{ cat.name }}</h1>
            <p class="mt-1 text-slate-600">{{ cat.description }}</p>
          </div>
        </div>

        @for (f of flows(); track f.id) {
          <a [routerLink]="['/diagnose', f.id]" class="card-link mt-6 flex items-center gap-3">
            <app-icon name="diagnose" [size]="24" />
            <span
              ><strong>Guided diagnosis: {{ f.title }}</strong
              ><br /><span class="text-sm text-slate-600">{{ f.description }}</span></span
            >
          </a>
        }

        <div class="mt-8 flex flex-wrap items-end justify-between gap-3">
          <h2 class="text-xl font-bold">Guides ({{ guides().length }})</h2>
          <div>
            <label for="diff" class="mr-2 text-sm font-medium">Difficulty</label>
            <select
              id="diff"
              class="field inline-block w-auto capitalize"
              [value]="difficulty()"
              (change)="difficulty.set($any($event.target).value)"
            >
              <option value="">All levels</option>
              @for (d of levels; track d) {
                <option [value]="d">{{ d }}</option>
              }
            </select>
          </div>
        </div>
        <p class="sr-only-live" role="status">{{ guides().length }} guides shown</p>
        @if (guides().length) {
          <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (g of guides(); track g.id) {
              <app-guide-card [guide]="g" />
            }
          </div>
        } @else {
          <div class="mt-4">
            <app-empty-state
              title="No guides at this difficulty"
              message="Try another difficulty level."
              ><button type="button" class="btn-secondary" (click)="difficulty.set('')">
                Show all levels
              </button></app-empty-state
            >
          </div>
        }
      } @else {
        <app-empty-state
          icon="info"
          title="Category not found"
          message="That category does not exist. Pick one from the full list."
        >
          <a routerLink="/categories" class="btn-primary">View all categories</a>
        </app-empty-state>
      }
    </div>
  `,
})
export class CategoryDetailComponent {
  protected readonly content = inject(GuideService);
  private readonly diagnostics = inject(DiagnosticService);
  private readonly search = inject(SearchService);
  readonly slug = input.required<string>();
  protected readonly levels = DIFFICULTIES;
  protected readonly difficulty = signal<Difficulty | ''>('');

  protected readonly category = computed(() =>
    this.content.categories().find((c) => c.slug === this.slug()),
  );
  protected readonly flows = computed(() =>
    this.diagnostics.flows().filter((f) => f.categoryId === this.category()?.id),
  );
  protected readonly guides = computed(() => {
    const cat = this.category();
    return cat
      ? this.search.applyFilters(this.content.guidesForCategory(cat), {
          difficulty: this.difficulty(),
        })
      : [];
  });
}
