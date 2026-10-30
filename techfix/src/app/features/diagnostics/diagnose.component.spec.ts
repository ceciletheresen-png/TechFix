import { RouterTestingHarness } from '@angular/router/testing';
import { configureTestBed, loadContent } from '../../../testing/content';

describe('DiagnoseComponent (laptop-wifi flow)', () => {
  beforeEach(() => {
    configureTestBed();
    loadContent();
  });

  async function start(url = '/diagnose/laptop-wifi') {
    const h = await RouterTestingHarness.create();
    await h.navigateByUrl(url);
    h.detectChanges();
    const el = h.routeNativeElement as HTMLElement;
    const click = async (label: string) => {
      const btn = Array.from(el.querySelectorAll('button')).find((b) =>
        b.textContent?.includes(label),
      );
      if (!btn) throw new Error(`No button "${label}"`);
      btn.click();
      h.detectChanges();
      await h.fixture.whenStable();
      h.detectChanges();
    };
    return { h, el, click };
  }

  it('shows the first question, a progress bar and disabled Back', async () => {
    const { el } = await start();
    expect(el.querySelector('h2')?.textContent).toContain('Can other devices');
    const bar = el.querySelector('[role="progressbar"]') as HTMLElement;
    expect(bar.getAttribute('aria-valuenow')).toBe('0');
    expect(Number(bar.getAttribute('aria-valuemax'))).toBeGreaterThanOrEqual(3);
    const back = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Back'),
    ) as HTMLButtonElement;
    expect(back.disabled).toBe(true);
  });

  it('follows answers to the right question and outcome', async () => {
    const { el, click } = await start();
    await click('Yes, other devices work');
    expect(el.querySelector('h2')?.textContent).toContain('Is Wi-Fi turned on');
    await click('Yes, Wi-Fi is on');
    await click('No, the list is empty');
    expect(el.textContent).toContain('Check the wireless adapter');
    expect(el.textContent).toContain('When to get professional help');
    expect(el.querySelectorAll('app-guide-card').length).toBeGreaterThan(0);
  });

  it('Back returns to the previous question and Restart returns to the start', async () => {
    const { el, click } = await start();
    await click('Yes, other devices work');
    await click('Back');
    expect(el.querySelector('h2')?.textContent).toContain('Can other devices');
    await click('Yes, other devices work');
    await click('No, it is off');
    expect(el.textContent).toContain('Turn Wi-Fi on');
    await click('Restart diagnosis');
    expect(el.querySelector('h2')?.textContent).toContain('Can other devices');
    expect(el.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('0');
  });

  it('answer options are real buttons (keyboard accessible)', async () => {
    const { el } = await start();
    const options = el.querySelectorAll('section ul button');
    expect(options.length).toBe(2);
    options.forEach((o) => expect(o.tagName).toBe('BUTTON'));
  });

  it('shows a helpful message for an unknown flow', async () => {
    const { el } = await start('/diagnose/unknown-flow');
    expect(el.textContent).toContain('Diagnosis not found');
  });
});
