import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DiagnosticService } from '../../core/services/diagnostic.service';
import { GuideService } from '../../core/services/guide.service';
import { CategoryCardComponent } from '../../shared/components/category-card.component';
import { GuideCardComponent } from '../../shared/components/guide-card.component';
import { IconComponent } from '../../shared/components/icon.component';
import { SearchBoxComponent } from '../../shared/components/search-box.component';
import { StatusMessageComponent } from '../../shared/components/status-message.component';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    SearchBoxComponent,
    CategoryCardComponent,
    GuideCardComponent,
    IconComponent,
    StatusMessageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-navy-900 text-white">
      <div class="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        <h1 class="max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl">
          Fix everyday tech problems, one clear step at a time
        </h1>
        <p class="mt-3 max-w-2xl text-lg text-slate-200">
          Plain-language help for Windows PCs, laptops, Android phones, iPhones, Wi-Fi and
          Bluetooth. Safe steps first, and we tell you when to call a technician.
        </p>
        <div class="mt-6 max-w-2xl text-slate-900">
          <app-search-box (submitted)="search($event)" />
        </div>
        <p class="mt-3 text-sm text-slate-300">
          Try:
          <a routerLink="/search" [queryParams]="{ q: 'no internet' }" class="underline"
            >no internet</a
          >, <a routerLink="/search" [queryParams]="{ q: 'battery' }" class="underline">battery</a>,
          <a routerLink="/search" [queryParams]="{ q: 'slow' }" class="underline">slow</a>
        </p>
      </div>
    </section>

    <div class="mx-auto max-w-6xl space-y-14 px-4 py-10 sm:px-6">
      @if (content.status() !== 'ready') {
        <app-status-message [status]="content.status()" (retry)="content.load()" />
      } @else {
        <section aria-labelledby="cat-h">
          <div class="mb-4 flex items-end justify-between">
            <h2 id="cat-h" class="text-2xl font-bold">What are you fixing?</h2>
            <a routerLink="/categories" class="text-sm font-semibold text-brand-700 hover:underline"
              >All categories</a
            >
          </div>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            @for (c of quick(); track c.id) {
              <app-category-card [category]="c" [count]="content.guidesForCategory(c).length" />
            }
          </div>
        </section>

        <section aria-labelledby="pop-h">
          <h2 id="pop-h" class="mb-4 text-2xl font-bold">Popular guides</h2>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (g of content.popular(6); track g.id) {
              <app-guide-card [guide]="g" />
            }
          </div>
        </section>

        <section
          aria-labelledby="diag-h"
          class="card flex flex-col gap-4 p-6 md:flex-row md:items-center"
        >
          <span class="rounded-xl bg-brand-50 p-3 text-brand-700"
            ><app-icon name="diagnose" [size]="32"
          /></span>
          <div class="flex-1">
            <h2 id="diag-h" class="text-xl font-bold">Not sure what is wrong?</h2>
            <p class="mt-1 text-slate-600">
              Answer a few simple questions and we will point you to the right guide.
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            @for (f of diagnostics.flows(); track f.id) {
              <a [routerLink]="['/diagnose', f.id]" class="btn-secondary">{{ f.title }}</a>
            }
          </div>
        </section>

        <section aria-labelledby="new-h">
          <h2 id="new-h" class="mb-4 text-2xl font-bold">Recently reviewed</h2>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (g of content.recent(3); track g.id) {
              <app-guide-card [guide]="g" />
            }
          </div>
        </section>

        <section aria-labelledby="tips-h" class="rounded-xl bg-brand-50 p-6">
          <h2 id="tips-h" class="text-xl font-bold">
            New to troubleshooting? Four habits that help
          </h2>
          <ol class="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <li>
              <strong>Restart first.</strong> It fixes more problems than you would expect and loses
              nothing.
            </li>
            <li>
              <strong>Change one thing at a time.</strong> Then test, so you know what worked.
            </li>
            <li>
              <strong>Back up before big changes.</strong> Resets and reinstalls can erase files.
            </li>
            <li>
              <strong>Know when to stop.</strong> Swollen batteries, burning smells and liquid
              damage need a professional.
            </li>
          </ol>
        </section>
      }
    </div>
  `,
})
export class HomeComponent {
  protected readonly content = inject(GuideService);
  protected readonly diagnostics = inject(DiagnosticService);
  private readonly router = inject(Router);
  protected readonly quick = computed(() => this.content.categories().slice(0, 5));

  protected search(q: string): void {
    void this.router.navigate(['/search'], { queryParams: { q: q.trim() || null } });
  }
}
