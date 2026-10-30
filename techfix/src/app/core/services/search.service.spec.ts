import { TestBed } from '@angular/core/testing';
import { configureTestBed, loadContent } from '../../../testing/content';
import { SearchService, normalize } from './search.service';

describe('SearchService', () => {
  let service: SearchService;
  beforeEach(() => {
    configureTestBed();
    loadContent();
    service = TestBed.inject(SearchService);
  });

  it('normalizes case, punctuation, accents and whitespace', () => {
    expect(normalize('  Won’t   TURN-on! Café ')).toBe('wont turn on cafe');
  });

  it('is case-insensitive and ignores extra whitespace', () => {
    const a = service.search('WIFI   no   internet').map((r) => r.guide.id);
    const b = service.search('wifi no internet').map((r) => r.guide.id);
    expect(a.length).toBeGreaterThan(0);
    expect(a).toEqual(b);
  });

  it('finds guides by title, symptom, keyword and platform', () => {
    expect(service.search('laptop will not turn on')[0].guide.slug).toBe('laptop-wont-turn-on');
    expect(service.search('blue screen').map((r) => r.guide.slug)).toContain(
      'computer-restarting-unexpectedly',
    );
    expect(service.search('nxdomain').map((r) => r.guide.slug)).toContain('dns-resolution-errors');
    expect(service.search('iphone').map((r) => r.guide.slug)).toContain(
      'iphone-storage-almost-full',
    );
  });

  it('ranks title matches above other matches', () => {
    const results = service.search('overheating');
    expect(results[0].guide.slug).toBe('laptop-overheating');
  });

  it('returns nothing for gibberish and offers suggestions instead', () => {
    expect(service.search('zzqxv')).toEqual([]);
    expect(service.suggest('zzqxv').length).toBeGreaterThan(0); // falls back to popular guides
    expect(service.suggest('wifi banana').length).toBeGreaterThan(0); // partial matches
  });

  it('applies category, platform and difficulty filters', () => {
    const android = service.search('', { platform: 'android' });
    expect(android.length).toBeGreaterThan(0);
    expect(android.every((r) => r.guide.platforms.includes('android'))).toBe(true);
    const advanced = service.search('', { difficulty: 'advanced' });
    expect(advanced.every((r) => r.guide.difficulty === 'advanced')).toBe(true);
    const cat = service.search('', { categoryId: 'wifi-internet' });
    expect(cat.every((r) => r.guide.categoryId === 'wifi-internet')).toBe(true);
    expect(service.search('bluetooth', { categoryId: 'storage-performance' })).toEqual([]);
  });

  it('returns all guides alphabetically for an empty query', () => {
    const titles = service.search('   ').map((r) => r.guide.title);
    expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)));
  });
});
