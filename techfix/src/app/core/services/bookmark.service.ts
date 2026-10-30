import { Injectable, computed, inject, signal } from '@angular/core';
import { Bookmark } from '../models';
import { SafeStorageService } from './safe-storage.service';

export const BOOKMARKS_KEY = 'techfix.bookmarks.v1';
const MAX_BOOKMARKS = 200;

/** Accepts only well-formed, de-duplicated bookmarks; anything else is dropped. */
export function parseBookmarks(raw: unknown): Bookmark[] | null {
  if (!Array.isArray(raw)) return null;
  const seen = new Set<string>();
  const result: Bookmark[] = [];
  for (const item of raw as unknown[]) {
    if (typeof item !== 'object' || item === null) continue;
    const { guideId, savedAt } = item as Record<string, unknown>;
    if (typeof guideId !== 'string' || !guideId || guideId.length > 100 || seen.has(guideId))
      continue;
    seen.add(guideId);
    result.push({
      guideId,
      savedAt: typeof savedAt === 'string' ? savedAt : new Date(0).toISOString(),
    });
    if (result.length >= MAX_BOOKMARKS) break;
  }
  return result;
}

@Injectable({ providedIn: 'root' })
export class BookmarkService {
  private readonly storage = inject(SafeStorageService);
  readonly bookmarks = signal<Bookmark[]>(this.storage.read(BOOKMARKS_KEY, parseBookmarks) ?? []);
  readonly ids = computed(() => new Set(this.bookmarks().map((b) => b.guideId)));

  isBookmarked(guideId: string): boolean {
    return this.ids().has(guideId);
  }

  add(guideId: string): void {
    if (this.isBookmarked(guideId)) return;
    this.update([{ guideId, savedAt: new Date().toISOString() }, ...this.bookmarks()]);
  }

  remove(guideId: string): void {
    this.update(this.bookmarks().filter((b) => b.guideId !== guideId));
  }

  toggle(guideId: string): boolean {
    if (this.isBookmarked(guideId)) this.remove(guideId);
    else this.add(guideId);
    return this.isBookmarked(guideId);
  }

  private update(next: Bookmark[]): void {
    this.bookmarks.set(next);
    this.storage.write(BOOKMARKS_KEY, next);
  }
}
