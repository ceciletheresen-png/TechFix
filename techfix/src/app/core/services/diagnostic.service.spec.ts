import { DiagnosticFlow } from '../models';
import { DiagnosticSession, maxQuestionDepth, validateFlow } from './diagnostic-session';
import { flows } from '../../../testing/content';

const flow: DiagnosticFlow = {
  id: 't',
  title: 'Test',
  description: '',
  categoryId: 'c',
  startId: 'q1',
  nodes: [
    {
      type: 'question',
      id: 'q1',
      text: 'One?',
      options: [
        { label: 'Yes', next: 'q2' },
        { label: 'No', next: 'out-a' },
      ],
    },
    {
      type: 'question',
      id: 'q2',
      text: 'Two?',
      options: [
        { label: 'Yes', next: 'out-b' },
        { label: 'No', next: 'out-a' },
      ],
    },
    { type: 'outcome', id: 'out-a', title: 'A', summary: '', guideIds: [] },
    { type: 'outcome', id: 'out-b', title: 'B', summary: '', guideIds: [] },
  ],
};

describe('DiagnosticSession', () => {
  it('branches according to the chosen answers', () => {
    const s = new DiagnosticSession(flow);
    expect(s.question()?.id).toBe('q1');
    expect(s.answer(1)).toBe(true);
    expect(s.outcome()?.id).toBe('out-a');

    s.restart();
    s.answer(0);
    expect(s.question()?.id).toBe('q2');
    s.answer(0);
    expect(s.outcome()?.id).toBe('out-b');
    expect(s.answers().map((a) => a.label)).toEqual(['Yes', 'Yes']);
  });

  it('goes back one step at a time and cannot go back from the start', () => {
    const s = new DiagnosticSession(flow);
    expect(s.canGoBack()).toBe(false);
    s.answer(0);
    s.answer(0);
    s.back();
    expect(s.question()?.id).toBe('q2');
    s.back();
    expect(s.question()?.id).toBe('q1');
    s.back();
    expect(s.question()?.id).toBe('q1');
    expect(s.answered()).toBe(0);
  });

  it('restarts from the first question and clears answers', () => {
    const s = new DiagnosticSession(flow);
    s.answer(0);
    s.answer(1);
    s.restart();
    expect(s.question()?.id).toBe('q1');
    expect(s.answered()).toBe(0);
  });

  it('reports progress using the longest path', () => {
    expect(maxQuestionDepth(flow)).toBe(2);
    expect(new DiagnosticSession(flow).total).toBe(2);
  });

  it('ignores out-of-range answers and answers on an outcome', () => {
    const s = new DiagnosticSession(flow);
    expect(s.answer(9)).toBe(false);
    s.answer(1);
    expect(s.answer(0)).toBe(false);
  });

  it('handles an option that points to a missing node without crashing', () => {
    const broken: DiagnosticFlow = {
      ...flow,
      nodes: [
        {
          type: 'question',
          id: 'q1',
          text: 'One?',
          options: [
            { label: 'Oops', next: 'nowhere' },
            { label: 'Ok', next: 'out-a' },
          ],
        },
        { type: 'outcome', id: 'out-a', title: 'A', summary: '', guideIds: [] },
      ],
    };
    const s = new DiagnosticSession(broken);
    expect(s.answer(0)).toBe(false);
    expect(s.error()).toContain('missing');
    expect(s.question()?.id).toBe('q1');
  });

  it('shows an error when the start node is missing', () => {
    const s = new DiagnosticSession({ ...flow, startId: 'nope' });
    expect(s.node()).toBeNull();
    expect(s.error()).toBeTruthy();
  });
});

describe('validateFlow', () => {
  it('accepts a valid flow', () => expect(validateFlow(flow, new Set())).toEqual([]));

  it('detects invalid references, duplicates, missing start and unknown guides', () => {
    const bad: DiagnosticFlow = {
      ...flow,
      startId: 'missing',
      nodes: [
        { type: 'question', id: 'q1', text: '?', options: [{ label: 'a', next: 'ghost' }] },
        { type: 'outcome', id: 'q1', title: 'dup', summary: '', guideIds: ['g-unknown'] },
      ],
    };
    const errors = validateFlow(bad, new Set(['g-known']));
    expect(errors.some((e) => e.includes('Duplicate'))).toBe(true);
    expect(errors.some((e) => e.includes('Start node'))).toBe(true);
    expect(errors.some((e) => e.includes('ghost'))).toBe(true);
    expect(errors.some((e) => e.includes('fewer than two'))).toBe(true);
    expect(errors.some((e) => e.includes('g-unknown'))).toBe(true);
  });

  it('every shipped flow reaches an outcome on every possible answer path', () => {
    for (const f of flows) {
      let outcomes = 0;
      const walk = (path: number[]): void => {
        expect(path.length, `${f.id} is too deep or cyclic`).toBeLessThan(15);
        const s = new DiagnosticSession(f);
        for (const choice of path) expect(s.answer(choice), `${f.id} ${path}`).toBe(true);
        const q = s.question();
        if (!q) {
          expect(s.outcome(), `${f.id} ${path}`).not.toBeNull();
          outcomes++;
          return;
        }
        q.options.forEach((_, i) => walk([...path, i]));
      };
      walk([]);
      expect(outcomes, f.id).toBeGreaterThan(1);
    }
  });
});
