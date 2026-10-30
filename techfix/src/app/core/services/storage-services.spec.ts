import { TestBed } from '@angular/core/testing';
import { BOOKMARKS_KEY, BookmarkService, parseBookmarks } from './bookmark.service';
import { FEEDBACK_KEY, FeedbackService } from './feedback.service';
import { HISTORY_KEY, HistoryService, MAX_HISTORY } from './history.service';
import { SafeStorageService } from './safe-storage.service';

describe('LocalStorage-backed services', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });
  afterEach(() => vi.restoreAllMocks());

  describe('BookmarkService', () => {
    it('adds, removes and toggles bookmarks without duplicates', () => {
      const s = TestBed.inject(BookmarkService);
      s.add('g-a');
      s.add('g-a');
      s.add('g-b');
      expect(
        s
          .bookmarks()
          .map((b) => b.guideId)
          .sort(),
      ).toEqual(['g-a', 'g-b']);
      s.remove('g-a');
      expect(s.isBookmarked('g-a')).toBe(false);
      expect(s.toggle('g-a')).toBe(true);
      expect(s.toggle('g-a')).toBe(false);
    });

    it('persists and reloads bookmarks', () => {
      TestBed.inject(BookmarkService).add('g-keep');
      TestBed.resetTestingModule();
      expect(TestBed.inject(BookmarkService).isBookmarked('g-keep')).toBe(true);
    });

    it('ignores malformed JSON in storage', () => {
      localStorage.setItem(BOOKMARKS_KEY, '{not json');
      const s = TestBed.inject(BookmarkService);
      expect(s.bookmarks()).toEqual([]);
      s.add('g-a'); // still usable afterwards
      expect(s.isBookmarked('g-a')).toBe(true);
    });

    it('drops invalid and duplicate entries but keeps valid ones', () => {
      const parsed = parseBookmarks([
        { guideId: 'g-ok', savedAt: '2026-01-01T00:00:00Z' },
        { guideId: 'g-ok', savedAt: 'x' },
        { guideId: 42 },
        null,
        'text',
        { guideId: '' },
        { guideId: 'x'.repeat(500) },
      ]);
      expect(parsed?.map((b) => b.guideId)).toEqual(['g-ok']);
      expect(parseBookmarks({ not: 'an array' })).toBeNull();
    });

    it('does not crash when storage throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota');
      });
      const s = TestBed.inject(BookmarkService);
      expect(() => s.add('g-a')).not.toThrow();
      expect(s.isBookmarked('g-a')).toBe(true); // still works in memory
      expect(TestBed.inject(SafeStorageService).available()).toBe(false);
    });
  });

  describe('HistoryService', () => {
    it('records newest first, merges repeats and caps the list', () => {
      const s = TestBed.inject(HistoryService);
      s.record('g-1');
      s.record('g-2');
      s.record('g-1');
      expect(s.entries().map((e) => e.guideId)).toEqual(['g-1', 'g-2']);
      for (let i = 0; i < MAX_HISTORY + 5; i++) s.record(`g-extra-${i}`);
      expect(s.entries()).toHaveLength(MAX_HISTORY);
    });

    it('clears history from memory and storage', () => {
      const s = TestBed.inject(HistoryService);
      s.record('g-1');
      s.clear();
      expect(s.entries()).toEqual([]);
      expect(localStorage.getItem(HISTORY_KEY)).toBeNull();
    });

    it('survives corrupt stored data', () => {
      localStorage.setItem(HISTORY_KEY, '[1,2,{"guideId":"g-ok"}]');
      expect(
        TestBed.inject(HistoryService)
          .entries()
          .map((e) => e.guideId),
      ).toEqual(['g-ok']);
    });
  });

  describe('FeedbackService', () => {
    it('stores answers locally and rejects bad stored values', () => {
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify({ 'g-a': 'helped', 'g-b': 'banana' }));
      const s = TestBed.inject(FeedbackService);
      expect(s.get('g-a')).toBe('helped');
      expect(s.get('g-b')).toBeUndefined();
      s.set('g-b', 'not-helped');
      expect(JSON.parse(localStorage.getItem(FEEDBACK_KEY) ?? '{}')).toEqual({
        'g-a': 'helped',
        'g-b': 'not-helped',
      });
    });
  });
});
