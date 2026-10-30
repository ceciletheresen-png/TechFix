import { categories, flows, guides } from '../../testing/content';
import { validateFlow } from './services/diagnostic-session';

describe('shipped content', () => {
  const guideIds = new Set(guides.map((g) => g.id));

  it('has at least 25 complete guides', () => {
    expect(guides.length).toBeGreaterThanOrEqual(25);
    for (const g of guides) {
      expect(g.steps.length, g.id).toBeGreaterThanOrEqual(4);
      expect(g.symptoms.length, g.id).toBeGreaterThan(0);
      expect(g.causes.length, g.id).toBeGreaterThan(0);
      expect(g.keywords.length, g.id).toBeGreaterThan(0);
      for (const s of g.steps) expect(s.expected, g.id).toBeTruthy();
    }
  });

  it('has unique ids and slugs', () => {
    expect(new Set(guideIds).size).toBe(guides.length);
    expect(new Set(guides.map((g) => g.slug)).size).toBe(guides.length);
    expect(new Set(categories.map((c) => c.slug)).size).toBe(categories.length);
  });

  it('references only categories and related guides that exist', () => {
    const catIds = new Set(categories.map((c) => c.id));
    for (const g of guides) {
      expect(catIds.has(g.categoryId), `${g.id} category`).toBe(true);
      for (const r of g.relatedIds) expect(guideIds.has(r), `${g.id} -> ${r}`).toBe(true);
    }
  });

  it('has the ten required categories, each with at least one guide', () => {
    expect(categories).toHaveLength(10);
  });

  it('has valid diagnostic flows with no invalid references', () => {
    expect(flows.length).toBeGreaterThanOrEqual(1);
    for (const f of flows) expect(validateFlow(f, guideIds), f.id).toEqual([]);
  });
});
