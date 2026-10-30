import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Category, LoadStatus, TroubleshootingGuide } from '../models';

/** Loads and serves the local JSON content (categories and guides). */
@Injectable({ providedIn: 'root' })
export class GuideService {
  private readonly http = inject(HttpClient);

  readonly status = signal<LoadStatus>('loading');
  readonly categories = signal<Category[]>([]);
  readonly guides = signal<TroubleshootingGuide[]>([]);

  private readonly byId = computed(() => new Map(this.guides().map((g) => [g.id, g])));
  private readonly bySlug = computed(() => new Map(this.guides().map((g) => [g.slug, g])));

  /** Relative URLs resolve against <base href>, so this works under a GitHub Pages subpath. */
  async load(): Promise<void> {
    this.status.set('loading');
    try {
      const [categories, guides] = await Promise.all([
        firstValueFrom(this.http.get<Category[]>('assets/data/categories.json')),
        firstValueFrom(this.http.get<TroubleshootingGuide[]>('assets/data/guides.json')),
      ]);
      this.setData(categories, guides);
    } catch {
      this.status.set('error');
    }
  }

  setData(categories: Category[], guides: TroubleshootingGuide[]): void {
    this.categories.set(categories);
    this.guides.set(guides);
    this.status.set('ready');
  }

  guideById(id: string): TroubleshootingGuide | undefined {
    return this.byId().get(id);
  }

  guideBySlug(slug: string): TroubleshootingGuide | undefined {
    return this.bySlug().get(slug);
  }

  categoryBySlug(slug: string): Category | undefined {
    return this.categories().find((c) => c.slug === slug);
  }

  categoryById(id: string): Category | undefined {
    return this.categories().find((c) => c.id === id);
  }

  /** Guides filed under the category, plus guides for the category's platform if it has one. */
  guidesForCategory(category: Category): TroubleshootingGuide[] {
    return this.guides().filter(
      (g) =>
        g.categoryId === category.id ||
        (!!category.platform &&
          category.platform !== 'any' &&
          g.platforms.includes(category.platform)),
    );
  }

  popular(limit = 6): TroubleshootingGuide[] {
    return this.guides()
      .filter((g) => g.popular)
      .slice(0, limit);
  }

  recent(limit = 6): TroubleshootingGuide[] {
    return [...this.guides()]
      .sort((a, b) => b.lastReviewed.localeCompare(a.lastReviewed))
      .slice(0, limit);
  }

  /** Resolves ids to guides, silently skipping ids that no longer exist. */
  guidesByIds(ids: readonly string[]): TroubleshootingGuide[] {
    const map = this.byId();
    return ids.map((id) => map.get(id)).filter((g): g is TroubleshootingGuide => !!g);
  }
}
