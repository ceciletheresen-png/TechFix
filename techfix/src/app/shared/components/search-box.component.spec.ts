import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SearchBoxComponent } from './search-box.component';

@Component({
  imports: [SearchBoxComponent],
  template: `<app-search-box
    [value]="initial"
    (queryChange)="changes.push($event)"
    (submitted)="submits.push($event)"
  />`,
})
class HostComponent {
  initial = 'wifi';
  changes: string[] = [];
  submits: string[] = [];
}

describe('SearchBoxComponent', () => {
  afterEach(() => vi.useRealTimers());

  async function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    return {
      fixture,
      host: fixture.componentInstance,
      el,
      input: el.querySelector('input') as HTMLInputElement,
    };
  }

  it('has an accessible label, a search landmark and the default placeholder', async () => {
    const { el, input } = await setup();
    expect(el.querySelector('form')?.getAttribute('role')).toBe('search');
    expect(el.querySelector(`label[for="${input.id}"]`)?.textContent).toContain('Search');
    expect(input.placeholder).toBe('Describe your device problem...');
    expect(input.value).toBe('wifi');
  });

  it('debounces typing', async () => {
    const { host, input } = await setup();
    vi.useFakeTimers();
    input.value = 'bat';
    input.dispatchEvent(new Event('input'));
    input.value = 'battery';
    input.dispatchEvent(new Event('input'));
    expect(host.changes).toEqual([]);
    vi.advanceTimersByTime(300);
    expect(host.changes).toEqual(['battery']);
  });

  it('submits on Enter / form submit', async () => {
    const { host, el } = await setup();
    el.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(host.submits).toEqual(['wifi']);
  });

  it('clears the text with an accessibly named button', async () => {
    const { fixture, host, el, input } = await setup();
    const clear = el.querySelector('button[aria-label="Clear search"]') as HTMLButtonElement;
    expect(clear).toBeTruthy();
    clear.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.changes).toEqual(['']);
    expect(input.value).toBe('');
    expect(el.querySelector('button[aria-label="Clear search"]')).toBeNull();
  });
});
