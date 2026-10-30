import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  input,
  linkedSignal,
  output,
  viewChild,
} from '@angular/core';
import { IconComponent } from './icon.component';

let nextId = 0;

@Component({
  selector: 'app-search-box',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form role="search" class="relative" (submit)="submit($event)">
      <label [for]="id" class="sr-only">{{ label() }}</label>
      <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        ><app-icon name="search"
      /></span>
      <input
        #field
        [id]="id"
        type="search"
        autocomplete="off"
        class="field pl-10 pr-24 text-base shadow-sm"
        [placeholder]="placeholder()"
        [value]="text()"
        (input)="onInput($event)"
      />
      <div class="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
        @if (text()) {
          <button
            type="button"
            class="rounded-md p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Clear search"
            (click)="clear()"
          >
            <app-icon name="close" [size]="18" />
          </button>
        }
        <button type="submit" class="btn-primary min-h-9 px-3 py-1.5">Search</button>
      </div>
    </form>
  `,
})
export class SearchBoxComponent implements OnDestroy {
  protected readonly id = `search-${nextId++}`;
  readonly value = input('');
  readonly placeholder = input('Describe your device problem...');
  readonly label = input('Search troubleshooting guides');
  /** Delay before `queryChange` fires while typing. */
  readonly debounceMs = input(250);
  readonly queryChange = output<string>();
  readonly submitted = output<string>();

  protected readonly text = linkedSignal(() => this.value());
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected onInput(event: Event): void {
    this.text.set((event.target as HTMLInputElement).value);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.queryChange.emit(this.text()), this.debounceMs());
  }

  protected submit(event: Event): void {
    event.preventDefault();
    clearTimeout(this.timer);
    this.submitted.emit(this.text());
  }

  protected clear(): void {
    clearTimeout(this.timer);
    this.text.set('');
    this.queryChange.emit('');
    this.field().nativeElement.focus();
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }
}
