import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DIFFICULTIES, PLATFORMS, PLATFORM_LABELS, Difficulty, Platform } from '../../core/models';
import { GuideService } from '../../core/services/guide.service';
import { SearchService } from '../../core/services/search.service';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { GuideCardComponent } from '../../shared/components/guide-card.component';
import { SearchBoxComponent } from '../../shared/components/search-box.component';
import { StatusMessageComponent } from '../../shared/components/status-message.component';

/** Serves both /guides (browse) and /search. Filters live in the URL so results can be shared and bookmarked. */
@Component({
  selector: 'app-guide-browse',
  imports: [
    RouterLink,
    BreadcrumbsComponent,
    EmptyStateComponent,
    GuideCardComponent,
    SearchBoxComponent,
    StatusMessageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <app-breadcrumbs
        [items]="[
          { label: 'Home', link: '/' },
          { label: mode() === 'search' ? 'Search results' : 'Browse problems' },
        ]"
      />
      <h1 class="text-3xl font-bold">
        {{ mode() === 'search' ? 'Search results' : 'Browse problems' }}
      </h1>
      <div class="mt-4 max-w-2xl">
        <app-search-box
          [value]="q() ?? ''"
          (queryChange)="update({ q: $event })"
          (submitted)="update({ q: $event })"
        />
      </div>

      <div class="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <label for="f-cat" class="mb-1 block text-sm font-medium">Category</label>
          <select
            id="f-cat"
            class="field"
            [value]="category() ?? ''"
            (change)="update({ category: $any($event.target).value })"
          >
            <option value="">All categories</option>
            @for (c of content.categories(); track c.id) {
              <option [value]="c.id">{{ c.name }}</option>
            }
          </select>
        </div>
        <div>
          <label for="f-os" class="mb-1 block text-sm font-medium">Device / operating system</label>
          <select
            id="f-os"
            class="field"
            [value]="platform() ?? ''"
            (change)="update({ platform: $any($event.target).value })"
          >
            <option value="">Any</option>
            @for (p of platforms; track p) {
              <option [value]="p">{{ labels[p] }}</option>
            }
          </select>
        </div>
        <div>
          <label for="f-diff" class="mb-1 block text-sm font-medium">Difficulty</label>
          <select
            id="f-diff"
            class="field capitalize"
            [value]="difficulty() ?? ''"
            (change)="update({ difficulty: $any($event.target).value })"
          >
            <option value="">Any level</option>
            @for (d of levels; track d) {
              <option [value]="d">{{ d }}</option>
            }
          </select>
        </div>
      </div>

      @if (content.status() !== 'ready') {
        <div class="mt-6">
          <app-status-message [status]="content.status()" (retry)="content.load()" />
        </div>
      } @else {
        <div class="mt-5 flex flex-wrap items-center justify-between gap-2">
          <p role="status" aria-live="polite" class="text-sm text-slate-600">{{ summary() }}</p>
          @if (hasFilters()) {
            <button type="button" class="btn-secondary min-h-9" (click)="reset()">
              Reset search and filters
            </button>
          }
        </div>
        @if (results().length) {
          <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (r of results(); track r.guide.id) {
              <app-guide-card [guide]="r.guide" />
            }
          </div>
        } @else {
          <div class="mt-4">
            <app-empty-state
              title="No guides match your search"
              message="Try fewer or different words (for example 'wifi' instead of 'wireless network'), or remove a filter."
            >
              <button type="button" class="btn-primary" (click)="reset()">
                Reset search and filters
              </button>
            </app-empty-state>
          </div>
          @if (suggestions().length) {
            <h2 class="mt-8 text-xl font-bold">You might be looking for</h2>
            <div class="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              @for (g of suggestions(); track g.id) {
                <app-guide-card [guide]="g" />
              }
            </div>
          }
        }
        <p class="mt-8 text-sm text-slate-600">
          Not sure where to start? Try a
          <a routerLink="/diagnose" class="font-semibold text-brand-700 underline"
            >guided diagnosis</a
          >.
        </p>
      }
    </div>
  `,
})
export class GuideBrowseComponent {
  protected readonly content = inject(GuideService);
  private readonly searchService = inject(SearchService);
  private readonly router = inject(Router);

  // Bound from route data and query params (withComponentInputBinding).
  readonly mode = input<'browse' | 'search'>('browse');
  readonly q = input<string | undefined>();
  readonly category = input<string | undefined>();
  readonly platform = input<Platform | '' | undefined>();
  readonly difficulty = input<Difficulty | '' | undefined>();

  protected readonly platforms = PLATFORMS;
  protected readonly labels = PLATFORM_LABELS;
  protected readonly levels = DIFFICULTIES;

  protected readonly results = computed(() =>
    this.searchService.search(this.q() ?? '', {
      categoryId: this.category(),
      platform: this.platform(),
      difficulty: this.difficulty(),
    }),
  );
  protected readonly suggestions = computed(() =>
    this.q()?.trim() ? this.searchService.suggest(this.q() ?? '') : [],
  );
  protected readonly hasFilters = computed(
    () => !!(this.q()?.trim() || this.category() || this.platform() || this.difficulty()),
  );
  protected readonly summary = computed(() => {
    const n = this.results().length;
    return `${n} ${n === 1 ? 'guide' : 'guides'} found`;
  });

  protected update(change: Record<string, string>): void {
    const queryParams = Object.fromEntries(
      Object.entries(change).map(([k, v]) => [k, v.trim() || null]),
    );
    void this.router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl: true });
  }

  protected reset(): void {
    void this.router.navigate([], {
      queryParams: { q: null, category: null, platform: null, difficulty: null },
      queryParamsHandling: 'merge',
    });
  }
}
