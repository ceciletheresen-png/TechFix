import { Injectable, signal } from '@angular/core';

/**
 * Thin wrapper around localStorage that never throws. Storage can be missing
 * (private mode, blocked cookies), full, or contain malformed data.
 */
@Injectable({ providedIn: 'root' })
export class SafeStorageService {
  /** False once any storage operation has failed. */
  readonly available = signal(true);

  /** Returns parsed JSON that passes `validate`, otherwise `null`. */
  read<T>(key: string, validate: (raw: unknown) => T | null): T | null {
    try {
      const text = window.localStorage.getItem(key);
      if (text === null) return null;
      return validate(JSON.parse(text) as unknown);
    } catch {
      this.available.set(false);
      return null;
    }
  }

  write(key: string, value: unknown): boolean {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      this.available.set(false);
      return false;
    }
  }

  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      this.available.set(false);
    }
  }
}
