import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { Router } from '@angular/router';
import { configureTestBed, loadContent } from '../testing/content';
import { BookmarkService } from './core/services/bookmark.service';
import { HistoryService } from './core/services/history.service';

describe('routing and pages', () => {
  beforeEach(() => {
    localStorage.clear();
    configureTestBed();
    loadContent();
  });

  async function visit(url: string) {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
    return harness;
  }
  const text = (h: RouterTestingHarness) => (h.routeNativeElement as HTMLElement).textContent ?? '';

  it('shows a not-found page for unknown routes', async () => {
    const h = await visit('/definitely/not/a/page');
    expect(text(h)).toContain('Page not found');
    expect((h.routeNativeElement as HTMLElement).querySelector('a[href="/"]')).toBeTruthy();
  });

  it('renders the home page with search, categories and popular guides', async () => {
    const h = await visit('/');
    const el = h.routeNativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Fix everyday tech problems');
    expect(el.querySelector('input[type="search"]')).toBeTruthy();
    expect(el.querySelectorAll('app-category-card').length).toBeGreaterThan(0);
    expect(el.querySelectorAll('app-guide-card').length).toBeGreaterThan(0);
  });

  it('lists all ten categories', async () => {
    const h = await visit('/categories');
    expect(
      (h.routeNativeElement as HTMLElement).querySelectorAll('app-category-card'),
    ).toHaveLength(10);
  });

  it("category selection shows that category's guides and a diagnosis link where one exists", async () => {
    const h = await visit('/categories/wifi-internet');
    const el = h.routeNativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Wi-Fi and internet connectivity');
    expect(el.textContent).toContain('Laptop cannot connect to Wi-Fi');
    const titles = Array.from(el.querySelectorAll('app-guide-card h3')).map((n) => n.textContent);
    expect(titles).toContain('Slow Wi-Fi connection');
  });

  it('shows a friendly message for an unknown category', async () => {
    const h = await visit('/categories/nope');
    expect(text(h)).toContain('Category not found');
  });

  it('filters guides by difficulty on the category page', async () => {
    const h = await visit('/categories/windows-pcs');
    const el = h.routeNativeElement as HTMLElement;
    const before = el.querySelectorAll('app-guide-card').length;
    const select = el.querySelector('#diff') as HTMLSelectElement;
    select.value = 'intermediate';
    select.dispatchEvent(new Event('change'));
    h.detectChanges();
    const after = el.querySelectorAll('app-guide-card').length;
    expect(after).toBeGreaterThan(0);
    expect(after).toBeLessThan(before);
  });

  it('search page shows matching results from the query string', async () => {
    const h = await visit('/search?q=dns');
    const el = h.routeNativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Search results');
    expect(el.textContent).toContain('DNS resolution errors');
    expect((el.querySelector('input[type="search"]') as HTMLInputElement).value).toBe('dns');
  });

  it('search page shows an empty state with suggestions when nothing matches', async () => {
    const h = await visit('/search?q=zzqxv');
    const el = h.routeNativeElement as HTMLElement;
    expect(el.textContent).toContain('No guides match your search');
    expect(el.textContent).toContain('You might be looking for');
    expect(el.querySelectorAll('app-guide-card').length).toBeGreaterThan(0);
  });

  it('browse page filters by platform from the URL', async () => {
    const h = await visit('/guides?platform=ios');
    const el = h.routeNativeElement as HTMLElement;
    expect(el.textContent).toContain('iPhone storage almost full');
    expect(el.textContent).not.toContain('Windows computer running slowly');
  });

  describe('guide detail page', () => {
    it('renders the real guide content, numbered steps and warnings', async () => {
      const h = await visit('/guides/laptop-wont-turn-on');
      const el = h.routeNativeElement as HTMLElement;
      expect(el.querySelector('h1')?.textContent).toContain('Laptop will not turn on');
      expect(el.querySelectorAll('ol > li').length).toBeGreaterThanOrEqual(5);
      expect(el.textContent).toContain('swollen battery');
      expect(el.textContent).toContain('Possible causes');
      expect(el.textContent).toContain('Related guides');
    });

    it('step checkboxes have labels and track progress without claiming the problem is solved', async () => {
      const h = await visit('/guides/slow-wifi');
      const el = h.routeNativeElement as HTMLElement;
      const boxes = Array.from(el.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
      expect(boxes.length).toBeGreaterThan(0);
      for (const b of boxes)
        expect(b.closest('label')?.textContent?.trim()).toMatch(/I have done step \d/);
      boxes[0].click();
      h.detectChanges();
      expect(el.textContent).toContain(`1 of ${boxes.length} steps ticked`);
      expect(el.textContent).toContain('does not mean the problem is fixed');
    });

    it('records the guide in recently viewed history', async () => {
      await visit('/guides/slow-wifi');
      expect(TestBed.inject(HistoryService).entries()[0].guideId).toBe('g-slow-wifi');
    });

    it('bookmark button toggles state and exposes aria-pressed', async () => {
      const h = await visit('/guides/slow-wifi');
      const el = h.routeNativeElement as HTMLElement;
      const btn = el.querySelector('header button') as HTMLButtonElement;
      expect(btn.getAttribute('aria-pressed')).toBe('false');
      btn.click();
      h.detectChanges();
      expect(btn.getAttribute('aria-pressed')).toBe('true');
      expect(TestBed.inject(BookmarkService).isBookmarked('g-slow-wifi')).toBe(true);
      btn.click();
      h.detectChanges();
      expect(TestBed.inject(BookmarkService).isBookmarked('g-slow-wifi')).toBe(false);
    });

    it('feedback is saved locally and says so', async () => {
      const h = await visit('/guides/slow-wifi');
      const el = h.routeNativeElement as HTMLElement;
      expect(el.textContent).toContain('saved on this device only');
      const yes = Array.from(el.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Yes, it helped'),
      ) as HTMLButtonElement;
      yes.click();
      h.detectChanges();
      expect(el.textContent).toContain('has not been sent anywhere');
    });

    it('shows a not-found message for an unknown guide', async () => {
      const h = await visit('/guides/does-not-exist');
      expect(text(h)).toContain('Guide not found');
    });
  });

  describe('bookmarks page', () => {
    it('shows empty states first', async () => {
      const h = await visit('/bookmarks');
      expect(text(h)).toContain('No bookmarks yet');
      expect(text(h)).toContain('Nothing viewed yet');
    });

    it('lists saved guides, skips stale ids, and clears history', async () => {
      TestBed.inject(BookmarkService).add('g-slow-wifi');
      TestBed.inject(BookmarkService).add('g-removed-guide');
      TestBed.inject(HistoryService).record('g-dns-resolution-errors');
      const h = await visit('/bookmarks');
      const el = h.routeNativeElement as HTMLElement;
      expect(el.textContent).toContain('Slow Wi-Fi connection');
      expect(el.textContent).toContain('Saved guides (1)');
      expect(el.textContent).toContain('DNS resolution errors');
      const clear = Array.from(el.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Clear history'),
      ) as HTMLButtonElement;
      clear.click();
      h.detectChanges();
      expect(el.textContent).toContain('Nothing viewed yet');
    });
  });

  it('navigates between routes with the Router', async () => {
    await visit('/');
    await TestBed.inject(Router).navigateByUrl('/about');
    expect(TestBed.inject(Router).url).toBe('/about');
  });
});
