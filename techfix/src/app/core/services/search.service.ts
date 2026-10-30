import { Injectable, inject } from '@angular/core';
import { Category, Difficulty, PLATFORM_LABELS, Platform, TroubleshootingGuide } from '../models';
import { GuideService } from './guide.service';

export interface SearchFilters {
  categoryId?: string;
  platform?: Platform | '';
  difficulty?: Difficulty | '';
}

export interface SearchResult {
  guide: TroubleshootingGuide;
  score: number;
}

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'my',
  'is',
  'are',
  'to',
  'of',
  'and',
  'on',
  'in',
  'it',
  'me',
  'i',
  'do',
  'does',
  'how',
]);

/** Lower-case, strip accents and punctuation, collapse whitespace. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokenize(query: string): string[] {
  return normalize(query)
    .split(' ')
    .filter((t) => t && !STOP_WORDS.has(t))
    .map((t) => (t.length > 3 && t.endsWith('s') ? t.slice(0, -1) : t));
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly guideService = inject(GuideService);

  /** Guides matching ALL words in the query, best match first. Empty query returns every filtered guide. */
  search(query: string, filters: SearchFilters = {}): SearchResult[] {
    return this.run(
      this.guideService.guides(),
      this.guideService.categories(),
      query,
      filters,
      'all',
    );
  }

  /** Looser matching (ANY word) for the "did you mean" list, falling back to popular guides. */
  suggest(query: string, limit = 4): TroubleshootingGuide[] {
    const partial = this.run(
      this.guideService.guides(),
      this.guideService.categories(),
      query,
      {},
      'any',
    )
      .slice(0, limit)
      .map((r) => r.guide);
    return partial.length ? partial : this.guideService.popular(limit);
  }

  applyFilters(guides: TroubleshootingGuide[], filters: SearchFilters): TroubleshootingGuide[] {
    return guides.filter(
      (g) =>
        (!filters.categoryId || g.categoryId === filters.categoryId) &&
        (!filters.platform || g.platforms.includes(filters.platform)) &&
        (!filters.difficulty || g.difficulty === filters.difficulty),
    );
  }

  private run(
    guides: TroubleshootingGuide[],
    categories: Category[],
    query: string,
    filters: SearchFilters,
    mode: 'all' | 'any',
  ): SearchResult[] {
    const pool = this.applyFilters(guides, filters);
    const tokens = tokenize(query);
    if (!tokens.length) {
      return [...pool]
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((guide) => ({ guide, score: 0 }));
    }
    const catName = new Map(categories.map((c) => [c.id, c.name]));
    const results: SearchResult[] = [];
    for (const guide of pool) {
      const fields: [string, number][] = [
        [normalize(guide.title), 10],
        [normalize(guide.keywords.join(' ')), 6],
        [normalize(guide.symptoms.join(' ')), 5],
        [
          normalize(
            `${catName.get(guide.categoryId) ?? ''} ${guide.platforms.map((p) => PLATFORM_LABELS[p]).join(' ')} ${guide.difficulty}`,
          ),
          3,
        ],
        [normalize(guide.description), 3],
        [normalize(guide.causes.join(' ')), 2],
      ];
      let score = 0;
      let matched = 0;
      for (const token of tokens) {
        const best = Math.max(
          0,
          ...fields.map(([text, weight]) => (text.includes(token) ? weight : 0)),
        );
        if (best > 0) matched++;
        score += best;
      }
      if (mode === 'all' ? matched === tokens.length : matched > 0) results.push({ guide, score });
    }
    return results.sort((a, b) => b.score - a.score || a.guide.title.localeCompare(b.guide.title));
  }
}
