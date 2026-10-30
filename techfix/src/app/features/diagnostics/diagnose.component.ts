import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DiagnosticService } from '../../core/services/diagnostic.service';
import { GuideService } from '../../core/services/guide.service';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs.component';
import { CalloutComponent } from '../../shared/components/callout.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { GuideCardComponent } from '../../shared/components/guide-card.component';
import { IconComponent } from '../../shared/components/icon.component';
import { StatusMessageComponent } from '../../shared/components/status-message.component';

/** Generic player for any JSON diagnostic flow. */
@Component({
  selector: 'app-diagnose',
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
    <div class="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      @if (diagnostics.status() !== 'ready') {
        <app-status-message [status]="diagnostics.status()" (retry)="diagnostics.load()" />
      } @else if (session(); as s) {
        <app-breadcrumbs
          [items]="[
            { label: 'Home', link: '/' },
            { label: 'Guided diagnosis', link: '/diagnose' },
            { label: s.flow.title },
          ]"
        />
        <p class="text-sm font-semibold uppercase tracking-wide text-brand-700">Guided diagnosis</p>
        <h1 class="text-2xl font-bold sm:text-3xl">{{ s.flow.title }}</h1>

        @if (s.error(); as err) {
          <div class="mt-4" role="alert">
            <app-callout kind="warning" heading="Something went wrong">{{ err }}</app-callout>
          </div>
        }

        @if (s.question(); as q) {
          <div
            class="mt-5"
            role="progressbar"
            [attr.aria-valuemin]="0"
            [attr.aria-valuemax]="s.total"
            [attr.aria-valuenow]="s.answered()"
            [attr.aria-valuetext]="'Question ' + (s.answered() + 1) + ' of up to ' + s.total"
          >
            <div class="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                class="h-full rounded-full bg-brand-600 transition-all"
                [style.width.%]="(s.answered() / s.total) * 100"
              ></div>
            </div>
            <p class="mt-1 text-sm text-slate-600">
              Question {{ s.answered() + 1 }} of up to {{ s.total }}
            </p>
          </div>
          <section class="card mt-4 p-6" aria-labelledby="q-h">
            <h2 #heading id="q-h" tabindex="-1" class="text-xl font-semibold outline-none">
              {{ q.text }}
            </h2>
            @if (q.help) {
              <p class="mt-2 text-sm text-slate-600">{{ q.help }}</p>
            }
            <ul class="mt-5 space-y-3">
              @for (o of q.options; track $index; let i = $index) {
                <li>
                  <button
                    type="button"
                    class="btn-secondary w-full justify-between text-left"
                    (click)="answer(i)"
                  >
                    <span>{{ o.label }}</span
                    ><app-icon name="chevron-right" />
                  </button>
                </li>
              }
            </ul>
          </section>
        } @else if (s.outcome(); as o) {
          <section class="card mt-5 p-6" aria-labelledby="o-h">
            <p class="inline-flex items-center gap-1 text-sm font-semibold text-accent-700">
              <app-icon name="ok" [size]="18" /> Result
            </p>
            <h2 #heading id="o-h" tabindex="-1" class="mt-1 text-xl font-semibold outline-none">
              {{ o.title }}
            </h2>
            <p class="mt-2 leading-relaxed">{{ o.summary }}</p>
            @if (o.professionalHelp) {
              <div class="mt-4">
                <app-callout kind="warning" heading="When to get professional help">{{
                  o.professionalHelp
                }}</app-callout>
              </div>
            }
          </section>
          <h3 class="mt-6 text-lg font-bold">Guides to follow</h3>
          <div class="mt-3 grid gap-4 sm:grid-cols-2">
            @for (g of guides(); track g.id) {
              <app-guide-card [guide]="g" />
            }
          </div>
          @if (s.answers().length) {
            <details class="mt-6 text-sm">
              <summary class="cursor-pointer font-medium">Your answers</summary>
              <ol class="mt-2 list-decimal space-y-1 pl-5">
                @for (a of s.answers(); track $index) {
                  <li>{{ a.label }}</li>
                }
              </ol>
            </details>
          }
        }

        <div class="mt-6 flex flex-wrap gap-2">
          <button type="button" class="btn-secondary" [disabled]="!s.canGoBack()" (click)="back()">
            <app-icon name="chevron-left" /> Back
          </button>
          <button type="button" class="btn-secondary" (click)="restart()">
            <app-icon name="restart" /> Restart diagnosis
          </button>
        </div>
        <p class="mt-6 text-xs text-slate-600">
          This tool gives general guidance, not a guarantee. Nothing you answer is stored or sent
          anywhere.
        </p>
      } @else {
        <app-empty-state
          icon="info"
          title="Diagnosis not found"
          message="That diagnosis does not exist."
        >
          <a routerLink="/diagnose" class="btn-primary">See all diagnoses</a>
        </app-empty-state>
      }
    </div>
  `,
})
export class DiagnoseComponent {
  protected readonly diagnostics = inject(DiagnosticService);
  private readonly content = inject(GuideService);
  readonly flowId = input.required<string>();
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');

  protected readonly session = computed(() => {
    const flow = this.diagnostics.flow(this.flowId());
    return flow ? this.diagnostics.createSession(flow) : null;
  });
  protected readonly guides = computed(() =>
    this.content.guidesByIds(this.session()?.outcome()?.guideIds ?? []),
  );

  protected answer(i: number): void {
    if (this.session()?.answer(i)) this.focusHeading();
  }
  protected back(): void {
    this.session()?.back();
    this.focusHeading();
  }
  protected restart(): void {
    this.session()?.restart();
    this.focusHeading();
  }
  /** Moves focus to the new question/result so screen-reader users hear it. */
  private focusHeading(): void {
    setTimeout(() => this.heading()?.nativeElement.focus(), 0);
  }
}
