import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconComponent } from './icon.component';

type Kind = 'warning' | 'info' | 'success';
const STYLE: Record<Kind, { box: string; icon: string; label: string }> = {
  warning: {
    box: 'border-amber-500 bg-amber-50 text-amber-950',
    icon: 'warning',
    label: 'Warning',
  },
  info: { box: 'border-brand-600 bg-brand-50 text-navy-900', icon: 'info', label: 'Note' },
  success: {
    box: 'border-accent-700 bg-accent-50 text-navy-900',
    icon: 'ok',
    label: 'Good to know',
  },
};

/** Icon + text label so meaning never depends on colour alone. */
@Component({
  selector: 'app-callout',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex gap-3 rounded-lg border-l-4 p-4 text-sm"
      [class]="style().box"
      [attr.role]="kind() === 'warning' ? 'note' : null"
    >
      <app-icon [name]="style().icon" [size]="20" />
      <div>
        <p class="font-semibold">{{ heading() || style().label }}</p>
        <div class="mt-1 leading-relaxed"><ng-content /></div>
      </div>
    </div>
  `,
})
export class CalloutComponent {
  readonly kind = input<Kind>('warning');
  readonly heading = input('');
  protected readonly style = computed(() => STYLE[this.kind()]);
}
