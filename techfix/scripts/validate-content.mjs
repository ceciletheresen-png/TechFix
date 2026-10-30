// Validates local JSON content: unique ids, valid references and diagnostic flows with no dead ends.
// Run with `npm run validate:content`. It also runs automatically before `npm run build`.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets', 'data');
const read = (f) => JSON.parse(readFileSync(join(dir, f), 'utf8'));
const categories = read('categories.json');
const guides = read('guides.json');
const flows = read('diagnostic-flows.json');
const errors = [];
const fail = (m) => errors.push(m);

const unique = (items, key, label) => {
  const seen = new Set();
  for (const i of items) {
    if (seen.has(i[key])) fail(`${label}: duplicate ${key} "${i[key]}"`);
    seen.add(i[key]);
  }
  return seen;
};
const catIds = unique(categories, 'id', 'category');
unique(categories, 'slug', 'category');
const guideIds = unique(guides, 'id', 'guide');
unique(guides, 'slug', 'guide');
unique(flows, 'id', 'flow');

for (const g of guides) {
  if (!catIds.has(g.categoryId)) fail(`guide ${g.id}: unknown category ${g.categoryId}`);
  for (const r of g.relatedIds ?? []) if (!guideIds.has(r)) fail(`guide ${g.id}: unknown related guide ${r}`);
  if (!g.steps?.length) fail(`guide ${g.id}: has no steps`);
  if (!g.steps?.every((s) => s.title && s.instruction && s.expected)) fail(`guide ${g.id}: incomplete step`);
}
for (const f of flows) {
  if (!catIds.has(f.categoryId)) fail(`flow ${f.id}: unknown category ${f.categoryId}`);
  const ids = unique(f.nodes, 'id', `flow ${f.id} node`);
  if (!ids.has(f.startId)) fail(`flow ${f.id}: start node ${f.startId} missing`);
  const byId = new Map(f.nodes.map((n) => [n.id, n]));
  for (const n of f.nodes) {
    if (n.type === 'question') {
      if (n.options.length < 2) fail(`flow ${f.id}: question ${n.id} needs at least two options`);
      for (const o of n.options) if (!ids.has(o.next)) fail(`flow ${f.id}: ${n.id} -> unknown node ${o.next}`);
    } else if (n.type === 'outcome') {
      for (const gId of n.guideIds) if (!guideIds.has(gId)) fail(`flow ${f.id}: outcome ${n.id} unknown guide ${gId}`);
    } else fail(`flow ${f.id}: node ${n.id} has invalid type`);
  }
  // Reachability and cycle detection
  const reach = new Set();
  const stack = new Set();
  const walk = (id) => {
    if (stack.has(id)) return fail(`flow ${f.id}: cycle through ${id}`);
    if (reach.has(id)) return;
    reach.add(id);
    const n = byId.get(id);
    if (n?.type === 'question') {
      stack.add(id);
      n.options.forEach((o) => byId.has(o.next) && walk(o.next));
      stack.delete(id);
    }
  };
  walk(f.startId);
  for (const id of ids) if (!reach.has(id)) fail(`flow ${f.id}: node ${id} is unreachable`);
}

if (errors.length) {
  console.error(`Content validation failed (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`Content OK: ${categories.length} categories, ${guides.length} guides, ${flows.length} diagnostic flows.`);
