import { Injectable, inject, signal } from '@angular/core';
import { HistoryEntry } from '../models';
import { SafeStorageService } from './safe-storage.service';

export const HISTORY_KEY = 'techfix.history.v1';
export const MAX_HISTORY = 12;

export function parseHistory(raw: unknown): HistoryEntry[] | null {
  if (!Array.isArray(raw)) return null;
  const seen = new Set<string>();
  const result: HistoryEntry[] = [];
  for (const item of raw as unknown[]) {
    if (typeof item !== 'object' || item === null) continue;
    const { guideId, viewedAt } = item as Record<string, unknown>;
    if (typeof guideId !== 'string' || !guideId || guideId.length > 100 || seen.has(guideId))
      continue;
    seen.add(guideId);
    result.push({
      guideId,
      viewedAt: typeof viewedAt === 'string' ? viewedAt : new Date(0).toISOString(),
    });
    if (result.length >= MAX_HISTORY) break;
  }
  return result;
}

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly storage = inject(SafeStorageService);
  readonly entries = signal<HistoryEntry[]>(this.storage.read(HISTORY_KEY, parseHistory) ?? []);

  /** Records a view; the newest guide goes first and repeats are merged. */
  record(guideId: string): void {
    const next = [
      { guideId, viewedAt: new Date().toISOString() },
      ...this.entries().filter((e) => e.guideId !== guideId),
    ].slice(0, MAX_HISTORY);
    this.entries.set(next);
    this.storage.write(HISTORY_KEY, next);
  }

  clear(): void {
    this.entries.set([]);
    this.storage.remove(HISTORY_KEY);
  }
}
