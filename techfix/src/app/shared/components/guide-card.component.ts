import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PLATFORM_LABELS, TroubleshootingGuide } from '../../core/models';
import { BookmarkService } from '../../core/services/bookmark.service';
import { DifficultyBadgeComponent } from './difficulty-badge.component';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-guide-card',
  imports: [RouterLink, IconComponent, DifficultyBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="card relative flex h-full flex-col p-5 transition hover:border-brand-600 hover:shadow-md"
    >
      <div class="mb-2 flex items-center justify-between gap-2 pr-10">
        <app-difficulty-badge [level]="guide().difficulty" />
        <span class="inline-flex items-center gap-1 text-xs text-slate-600">
          <app-icon name="clock" [size]="14" /> {{ guide().minutes }} min
        </span>
      </div>
      <h3 class="text-base font-semibold leading-snug">
        <a
          [routerLink]="['/guides', guide().slug]"
          class="after:absolute after:inset-0 after:content-[''] hover:text-brand-700"
          >{{ guide().title }}</a
        >
      </h3>
      <p class="mt-2 line-clamp-3 text-sm text-slate-600">{{ guide().description }}</p>
      <p class="mt-auto pt-3 text-xs text-slate-500">{{ platformText() }}</p>
      <button
        type="button"
        class="absolute right-3 top-3 z-10 rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-brand-700"
        [attr.aria-pressed]="saved()"
        [attr.aria-label]="(saved() ? 'Remove bookmark: ' : 'Bookmark: ') + guide().title"
        (click)="bookmarks.toggle(guide().id)"
      >
        <app-icon [name]="saved() ? 'bookmark-on' : 'bookmark'" [size]="20" />
      </button>
    </article>
  `,
})
export class GuideCardComponent {
  protected readonly bookmarks = inject(BookmarkService);
  readonly guide = input.required<TroubleshootingGuide>();
  protected readonly saved = computed(() => this.bookmarks.isBookmarked(this.guide().id));
  protected readonly platformText = computed(() =>
    this.guide()
      .platforms.map((p) => PLATFORM_LABELS[p])
      .join(' · '),
  );
}
