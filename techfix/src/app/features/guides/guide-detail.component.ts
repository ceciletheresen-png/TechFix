import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  untracked,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { PLATFORM_LABELS } from '../../core/models';
import { BookmarkService } from '../../core/services/bookmark.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { GuideService } from '../../core/services/guide.service';
import { HistoryService } from '../../core/services/history.service';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs.component';
import { CalloutComponent } from '../../shared/components/callout.component';
import { DifficultyBadgeComponent } from '../../shared/components/difficulty-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { GuideCardComponent } from '../../shared/components/guide-card.component';
import { IconComponent } from '../../shared/components/icon.component';
import { StatusMessageComponent } from '../../shared/components/status-message.component';

@Component({
  selector: 'app-guide-detail',
  imports: [
    RouterLink,
    BreadcrumbsComponent,
    CalloutComponent,
    DifficultyBadgeComponent,
    EmptyStateComponent,
    GuideCardComponent,
    IconComponent,
    StatusMessageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      @if (content.status() !== 'ready') {
        <app-status-message [status]="content.status()" (retry)="content.load()" />
      } @else if (guide(); as g) {
        <app-breadcrumbs [items]="crumbs()" />
        <article>
          <header>
            <div class="flex flex-wrap items-start justify-between gap-3">
              <h1 class="text-3xl font-bold leading-tight">{{ g.title }}</h1>
              <button
                type="button"
                class="btn-secondary"
                [attr.aria-pressed]="saved()"
                (click)="bookmarks.toggle(g.id)"
              >
                <app-icon [name]="saved() ? 'bookmark-on' : 'bookmark'" />
                {{ saved() ? 'Bookmarked' : 'Bookmark' }}
              </button>
            </div>
            <p class="mt-2 text-lg text-slate-600">{{ g.description }}</p>
            <dl class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <div class="flex items-center gap-2">
                <dt class="sr-only">Difficulty</dt>
                <dd><app-difficulty-badge [level]="g.difficulty" /></dd>
              </div>
              <div class="flex items-center gap-1">
                <dt class="sr-only">Estimated time</dt>
                <dd class="inline-flex items-center gap-1">
                  <app-icon name="clock" [size]="16" /> About {{ g.minutes }} minutes
                </dd>
              </div>
              <div>
                <dt class="inline font-medium">Works on:</dt>
                <dd class="inline">{{ platformText() }}</dd>
              </div>
              <div>
                <dt class="inline font-medium">Last reviewed:</dt>
                <dd class="inline">
                  <time [attr.datetime]="g.lastReviewed">{{ g.lastReviewed }}</time>
                </dd>
              </div>
            </dl>
          </header>

          <div class="mt-6">
            <app-callout kind="info" heading="Before you start"
              >These instructions are informational. Back up important files before changing
              settings. Hardware repairs and advanced system changes may need a qualified
              technician.</app-callout
            >
          </div>
          @for (w of g.warnings ?? []; track w) {
            <div class="mt-3">
              <app-callout kind="warning">{{ w }}</app-callout>
            </div>
          }

          <section class="mt-8 grid gap-4 sm:grid-cols-2" aria-label="Symptoms and causes">
            <div class="card p-5">
              <h2 class="text-lg font-semibold">Symptoms</h2>
              <ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
                @for (s of g.symptoms; track s) {
                  <li>{{ s }}</li>
                }
              </ul>
            </div>
            <div class="card p-5">
              <h2 class="text-lg font-semibold">Possible causes</h2>
              <ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
                @for (c of g.causes; track c) {
                  <li>{{ c }}</li>
                }
              </ul>
            </div>
          </section>

          @if (g.tools?.length || g.prerequisites?.length) {
            <section class="card mt-4 p-5" aria-label="What you need">
              @if (g.tools?.length) {
                <h2 class="text-lg font-semibold">Tools you may need</h2>
                <ul class="mt-2 list-disc pl-5 text-sm">
                  @for (t of g.tools; track t) {
                    <li>{{ t }}</li>
                  }
                </ul>
              }
              @if (g.prerequisites?.length) {
                <h2 class="mt-3 text-lg font-semibold">Before you begin</h2>
                <ul class="mt-2 list-disc pl-5 text-sm">
                  @for (p of g.prerequisites; track p) {
                    <li>{{ p }}</li>
                  }
                </ul>
              }
            </section>
          }

          <section class="mt-10" aria-labelledby="steps-h">
            <div class="flex flex-wrap items-end justify-between gap-2">
              <h2 id="steps-h" class="text-2xl font-bold">Steps</h2>
              <p role="status" aria-live="polite" class="text-sm text-slate-600">
                {{ done().size }} of {{ g.steps.length }} steps ticked
              </p>
            </div>
            <p class="mt-1 text-sm text-slate-600">
              Tick each step as you go. Ticking steps does not mean the problem is fixed: test it
              after each step.
            </p>
            <ol class="mt-4 space-y-4">
              @for (s of g.steps; track $index; let i = $index) {
                <li class="card p-5" [class.opacity-70]="done().has(i)">
                  <div class="flex gap-4">
                    <span
                      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white"
                      aria-hidden="true"
                      >{{ i + 1 }}</span
                    >
                    <div class="min-w-0 flex-1">
                      <h3 class="text-lg font-semibold">Step {{ i + 1 }}: {{ s.title }}</h3>
                      <p class="mt-1 leading-relaxed">{{ s.instruction }}</p>
                      <p class="mt-2 text-sm text-slate-600">
                        <strong>What you should see:</strong> {{ s.expected }}
                      </p>
                      @if (s.warning) {
                        <div class="mt-3">
                          <app-callout kind="warning">{{ s.warning }}</app-callout>
                        </div>
                      }
                      <label
                        class="mt-3 inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium"
                      >
                        <input
                          type="checkbox"
                          class="h-5 w-5 accent-brand-600"
                          [checked]="done().has(i)"
                          (change)="toggle(i)"
                        />
                        I have done step {{ i + 1 }}
                      </label>
                    </div>
                  </div>
                </li>
              }
            </ol>
          </section>

          @if (g.recovery?.length) {
            <section class="mt-8">
              <h2 class="text-xl font-bold">How to undo changes</h2>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                @for (r of g.recovery; track r) {
                  <li>{{ r }}</li>
                }
              </ul>
            </section>
          }
          @if (g.alternatives?.length) {
            <section class="mt-8">
              <h2 class="text-xl font-bold">If this did not work</h2>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                @for (a of g.alternatives; track a) {
                  <li>{{ a }}</li>
                }
              </ul>
            </section>
          }

          <section class="card mt-10 p-5" aria-labelledby="fb-h">
            <h2 id="fb-h" class="text-lg font-semibold">Did this guide solve your problem?</h2>
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                class="btn-secondary"
                [attr.aria-pressed]="feedback() === 'helped'"
                (click)="feedbackService.set(g.id, 'helped')"
              >
                <app-icon name="thumbs-up" [size]="18" /> Yes, it helped
              </button>
              <button
                type="button"
                class="btn-secondary"
                [attr.aria-pressed]="feedback() === 'not-helped'"
                (click)="feedbackService.set(g.id, 'not-helped')"
              >
                <app-icon name="thumbs-down" [size]="18" /> No, not yet
              </button>
            </div>
            @if (feedback(); as f) {
              <p role="status" class="mt-3 text-sm">
                {{
                  f === 'helped'
                    ? 'Glad it helped.'
                    : 'Sorry about that. Try the related guides below, or ask a qualified technician.'
                }}
                Your answer is saved on this device only and has not been sent anywhere.
              </p>
            } @else {
              <p class="mt-3 text-sm text-slate-600">
                Your answer is saved on this device only. TechFix has no server and does not collect
                ratings.
              </p>
            }
          </section>

          @if (related().length) {
            <section class="mt-10" aria-labelledby="rel-h">
              <h2 id="rel-h" class="mb-3 text-xl font-bold">Related guides</h2>
              <div class="grid gap-4 sm:grid-cols-2">
                @for (r of related(); track r.id) {
                  <app-guide-card [guide]="r" />
                }
              </div>
            </section>
          }
        </article>
      } @else {
        <app-empty-state
          icon="info"
          title="Guide not found"
          message="We could not find that guide. It may have been renamed."
        >
          <a routerLink="/guides" class="btn-primary">Browse all problems</a>
        </app-empty-state>
      }
    </div>
  `,
})
export class GuideDetailComponent {
  protected readonly content = inject(GuideService);
  protected readonly bookmarks = inject(BookmarkService);
  protected readonly feedbackService = inject(FeedbackService);
  private readonly history = inject(HistoryService);
  private readonly title = inject(Title);

  readonly slug = input.required<string>();
  protected readonly guide = computed(() => this.content.guideBySlug(this.slug()));
  protected readonly saved = computed(() => {
    const g = this.guide();
    return !!g && this.bookmarks.isBookmarked(g.id);
  });
  protected readonly feedback = computed(() => {
    const g = this.guide();
    return g ? this.feedbackService.feedback()[g.id] : undefined;
  });
  protected readonly related = computed(() =>
    this.content.guidesByIds(this.guide()?.relatedIds ?? []),
  );
  protected readonly platformText = computed(() =>
    (this.guide()?.platforms ?? []).map((p) => PLATFORM_LABELS[p]).join(', '),
  );
  protected readonly crumbs = computed(() => {
    const g = this.guide();
    const cat = g ? this.content.categoryById(g.categoryId) : undefined;
    return [
      { label: 'Home', link: '/' },
      ...(cat ? [{ label: cat.name, link: `/categories/${cat.slug}` }] : []),
      { label: g?.title ?? '' },
    ];
  });
  /** Which steps the user has ticked in this session. Resets when a different guide opens. */
  protected readonly done = linkedSignal<unknown, Set<number>>({
    source: this.guide,
    computation: () => new Set<number>(),
  });

  constructor() {
    effect(() => {
      const g = this.guide();
      if (!g) return;
      this.title.setTitle(`${g.title} · TechFix`);
      untracked(() => this.history.record(g.id));
    });
  }

  protected toggle(index: number): void {
    this.done.update((s) => {
      const next = new Set(s);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }
}
