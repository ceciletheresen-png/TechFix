import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookmarkService } from '../../core/services/bookmark.service';
import { GuideService } from '../../core/services/guide.service';
import { HistoryService } from '../../core/services/history.service';
import { SafeStorageService } from '../../core/services/safe-storage.service';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs.component';
import { CalloutComponent } from '../../shared/components/callout.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { GuideCardComponent } from '../../shared/components/guide-card.component';
import { IconComponent } from '../../shared/components/icon.component';
import { StatusMessageComponent } from '../../shared/components/status-message.component';

@Component({
  selector: 'app-bookmarks',
  imports: [
    RouterLink,
    BreadcrumbsComponent,
    CalloutComponent,
    EmptyStateComponent,
    GuideCardComponent,
    IconComponent,
    StatusMessageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <app-breadcrumbs [items]="[{ label: 'Home', link: '/' }, { label: 'Bookmarks' }]" />
      <h1 class="text-3xl font-bold">Your bookmarks</h1>
      <p class="mt-2 text-slate-600">
        Saved only in this browser. No account needed and nothing is sent anywhere.
      </p>
      @if (!storage.available()) {
        <div class="mt-4">
          <app-callout kind="warning" heading="Saving is unavailable"
            >Your browser is blocking local storage, so bookmarks and history will be forgotten when
            you close this page.</app-callout
          >
        </div>
      }
      @if (content.status() !== 'ready') {
        <div class="mt-6">
          <app-status-message [status]="content.status()" (retry)="content.load()" />
        </div>
      } @else {
        <section class="mt-6" aria-labelledby="saved-h">
          <h2 id="saved-h" class="mb-3 text-xl font-bold">Saved guides ({{ saved().length }})</h2>
          @if (saved().length) {
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              @for (g of saved(); track g.id) {
                <app-guide-card [guide]="g" />
              }
            </div>
          } @else {
            <app-empty-state
              icon="bookmark"
              title="No bookmarks yet"
              message="Select the bookmark icon on any guide to keep it here for later."
            >
              <a routerLink="/guides" class="btn-primary">Browse problems</a>
            </app-empty-state>
          }
        </section>

        <section class="mt-10" aria-labelledby="hist-h">
          <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="hist-h" class="text-xl font-bold">Recently viewed</h2>
            @if (recent().length) {
              <button type="button" class="btn-secondary min-h-9" (click)="history.clear()">
                <app-icon name="trash" [size]="16" /> Clear history
              </button>
            }
          </div>
          @if (recent().length) {
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              @for (g of recent(); track g.id) {
                <app-guide-card [guide]="g" />
              }
            </div>
          } @else {
            <app-empty-state
              icon="history"
              title="Nothing viewed yet"
              message="Guides you open will appear here so you can find your way back."
            />
          }
        </section>
      }
    </div>
  `,
})
export class BookmarksComponent {
  protected readonly content = inject(GuideService);
  protected readonly history = inject(HistoryService);
  protected readonly storage = inject(SafeStorageService);
  private readonly bookmarks = inject(BookmarkService);
  protected readonly saved = computed(() =>
    this.content.guidesByIds(this.bookmarks.bookmarks().map((b) => b.guideId)),
  );
  protected readonly recent = computed(() =>
    this.content.guidesByIds(this.history.entries().map((e) => e.guideId)),
  );
}
