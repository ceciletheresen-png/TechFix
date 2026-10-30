import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Difficulty } from '../../core/models';

const BARS: Record<Difficulty, number> = { beginner: 1, intermediate: 2, advanced: 3 };

@Component({
  selector: 'app-difficulty-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-700"
    >
      <span class="flex gap-0.5" aria-hidden="true">
        @for (n of [1, 2, 3]; track n) {
          <span
            class="h-2.5 w-1.5 rounded-sm"
            [class]="n <= bars() ? 'bg-brand-600' : 'bg-slate-300'"
          ></span>
        }
      </span>
      {{ level() }}
    </span>
  `,
})
export class DifficultyBadgeComponent {
  readonly level = input.required<Difficulty>();
  protected readonly bars = computed(() => BARS[this.level()]);
}
