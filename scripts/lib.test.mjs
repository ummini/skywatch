import { describe, expect, it } from 'vitest';
import {
  annotatePlan,
  isTicked,
  parsePlan,
  renderChecklist,
  reviewerSection,
  slugify,
  tickBox,
} from './lib.mjs';

const plan = `# Feature: Loading screen

Some intro text.

## Chunk 1: LoadingScreen component
**Goal:** Show a plane while we wait.
- renders "Fetching departures..."

## Chunk 2: useDepartures hook (#7)
**Goal:** Track loading, success and error.

## Out of scope
- Real API
`;

describe('parsePlan', () => {
  it('finds every chunk with its number, title and body', () => {
    const { feature, chunks } = parsePlan(plan);

    expect(feature).toBe('Loading screen');
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toMatchObject({ number: 1, title: 'LoadingScreen component', issue: null });
    expect(chunks[0].body).toContain('Show a plane');
  });

  it('remembers issues that were already created', () => {
    const { chunks } = parsePlan(plan);
    expect(chunks[1]).toMatchObject({ number: 2, title: 'useDepartures hook', issue: 7 });
  });

  it('does not let a later section leak into the last chunk', () => {
    const { chunks } = parsePlan(plan);
    expect(chunks[1].body).not.toContain('Real API');
  });
});

describe('annotatePlan', () => {
  it('adds issue numbers to headings that do not have one yet', () => {
    const result = annotatePlan(plan, { 1: 12, 2: 99 });
    expect(result).toContain('## Chunk 1: LoadingScreen component (#12)');
    expect(result).toContain('## Chunk 2: useDepartures hook (#7)');
  });
});

describe('checklist', () => {
  it('starts with every box unticked', () => {
    const body = renderChecklist();
    expect(isTicked(body, 'tests-pass')).toBe(false);
    expect(body).not.toContain('[x]');
  });

  it('ticks exactly one box', () => {
    const body = tickBox(renderChecklist(), 'tests-pass');
    expect(isTicked(body, 'tests-pass')).toBe(true);
    expect(isTicked(body, 'committed')).toBe(false);
  });

  it('notices boxes a human ticked on GitHub', () => {
    const body = renderChecklist().replace(
      '- [ ] Tests approved by a human',
      '- [x] Tests approved by a human',
    );
    expect(isTicked(body, 'tests-approved')).toBe(true);
  });

  it('rejects unknown checklist items', () => {
    expect(() => isTicked('', 'make-it-pass')).toThrow(/Unknown checklist item/);
  });
});

describe('slugify', () => {
  it('turns a title into a safe branch name', () => {
    expect(slugify('LoadingScreen component (#12)')).toBe('loadingscreen-component');
    expect(slugify('Wire it into App: loading / error / success!')).toBe('wire-it-into-app-loading-error-success');
  });
});

describe('reviewerSection', () => {
  it('returns the reviewer checklist from the PR template', () => {
    const template = '## Summary\nstuff\n\n## Reviewer checklist (human)\n- [ ] I can explain it';
    expect(reviewerSection(template)).toBe('## Reviewer checklist (human)\n- [ ] I can explain it');
  });
});
