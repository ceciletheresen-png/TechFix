import { computed, signal } from '@angular/core';
import { DiagnosticFlow, DiagnosticNode, DiagnosticQuestion, SolutionOutcome } from '../models';

/** Returns a list of problems found in a flow (empty when the flow is valid). */
export function validateFlow(flow: DiagnosticFlow, knownGuideIds?: ReadonlySet<string>): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const n of flow.nodes) {
    if (ids.has(n.id)) errors.push(`Duplicate node id "${n.id}"`);
    ids.add(n.id);
  }
  if (!ids.has(flow.startId)) errors.push(`Start node "${flow.startId}" does not exist`);
  for (const n of flow.nodes) {
    if (n.type === 'question') {
      if (n.options.length < 2) errors.push(`Question "${n.id}" has fewer than two options`);
      for (const o of n.options)
        if (!ids.has(o.next)) errors.push(`"${n.id}" points to missing node "${o.next}"`);
    } else if (knownGuideIds) {
      for (const g of n.guideIds)
        if (!knownGuideIds.has(g)) errors.push(`Outcome "${n.id}" references unknown guide "${g}"`);
    }
  }
  return errors;
}

/** Longest chain of questions from the start node, used for the progress indicator. */
export function maxQuestionDepth(flow: DiagnosticFlow): number {
  const byId = new Map(flow.nodes.map((n) => [n.id, n]));
  const visiting = new Set<string>();
  const depth = (id: string): number => {
    const n = byId.get(id);
    if (!n || n.type !== 'question' || visiting.has(id)) return 0;
    visiting.add(id);
    const d = 1 + Math.max(0, ...n.options.map((o) => depth(o.next)));
    visiting.delete(id);
    return d;
  };
  return depth(flow.startId);
}

const START_ERROR = 'This diagnosis could not be started because its first step is missing.';

/** State machine for one run through a diagnostic flow. */
export class DiagnosticSession {
  private readonly byId: Map<string, DiagnosticNode>;
  private readonly trail = signal<{ nodeId: string; label: string }[]>([]);
  private readonly currentId: ReturnType<typeof signal<string>>;

  readonly total: number;
  readonly error: ReturnType<typeof signal<string | null>>;
  readonly node = computed<DiagnosticNode | null>(() => this.byId.get(this.currentId()) ?? null);
  readonly question = computed<DiagnosticQuestion | null>(() => {
    const n = this.node();
    return n?.type === 'question' ? n : null;
  });
  readonly outcome = computed<SolutionOutcome | null>(() => {
    const n = this.node();
    return n?.type === 'outcome' ? n : null;
  });
  readonly answers = computed(() => this.trail());
  readonly answered = computed(() => this.trail().length);
  readonly canGoBack = computed(() => this.trail().length > 0);

  constructor(readonly flow: DiagnosticFlow) {
    this.byId = new Map(flow.nodes.map((n) => [n.id, n]));
    this.total = maxQuestionDepth(flow);
    // Initialise state directly (no signal writes) so a session can safely be created inside a computed().
    const startOk = this.byId.has(flow.startId);
    this.currentId = signal(startOk ? flow.startId : '');
    this.error = signal(startOk ? null : START_ERROR);
  }

  /** Chooses an option. Returns false (and sets `error`) if the choice is invalid. */
  answer(optionIndex: number): boolean {
    const q = this.question();
    const option = q?.options[optionIndex];
    if (!q || !option) return false;
    if (!this.byId.has(option.next)) {
      this.error.set('This answer leads to a step that is missing. Please restart the diagnosis.');
      return false;
    }
    this.error.set(null);
    this.trail.update((t) => [...t, { nodeId: q.id, label: option.label }]);
    this.currentId.set(option.next);
    return true;
  }

  back(): void {
    const t = this.trail();
    if (!t.length) return;
    this.currentId.set(t[t.length - 1].nodeId);
    this.trail.set(t.slice(0, -1));
    this.error.set(null);
  }

  restart(): void {
    this.trail.set([]);
    this.error.set(null);
    this.currentId.set(this.byId.has(this.flow.startId) ? this.flow.startId : '');
    if (!this.node()) this.error.set(START_ERROR);
  }
}
