import { Injectable, inject, signal } from '@angular/core';
import { SafeStorageService } from './safe-storage.service';

export type FeedbackValue = 'helped' | 'not-helped';
export const FEEDBACK_KEY = 'techfix.feedback.v1';

export function parseFeedback(raw: unknown): Record<string, FeedbackValue> | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const result: Record<string, FeedbackValue> = {};
  for (const [id, value] of Object.entries(raw)) {
    if (id.length <= 100 && (value === 'helped' || value === 'not-helped')) result[id] = value;
  }
  return result;
}

/** Feedback stays in this browser only. It is never sent anywhere. */
@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly storage = inject(SafeStorageService);
  readonly feedback = signal<Record<string, FeedbackValue>>(
    this.storage.read(FEEDBACK_KEY, parseFeedback) ?? {},
  );

  get(guideId: string): FeedbackValue | undefined {
    return this.feedback()[guideId];
  }

  set(guideId: string, value: FeedbackValue): void {
    const next = { ...this.feedback(), [guideId]: value };
    this.feedback.set(next);
    this.storage.write(FEEDBACK_KEY, next);
  }
}
