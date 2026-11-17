import test from 'node:test';
import assert from 'node:assert/strict';
import { GLOSSARY_TERMS, findGlossaryTerm } from '../../src/data/glossary.js';

test('GLOSSARY_TERMS includes all required M1 terms with plain Vietnamese fields', () => {
  const requiredIds = [
    'ai',
    'prompt',
    'context',
    'hallucination',
    'agent',
    'skill',
    'mcp',
    'plugin',
    'token',
  ];

  const actualIds = GLOSSARY_TERMS.map((item) => item.id);
  for (const id of requiredIds) {
    assert.ok(actualIds.includes(id), `Missing glossary term: ${id}`);
  }

  for (const item of GLOSSARY_TERMS) {
    assert.ok(item.term.length > 0);
    assert.ok(item.plainName.length > 0);
    assert.ok(item.meaning.length > 0);
    assert.ok(item.analogy.length > 0);
    assert.ok(item.example.length > 0);
  }
});

test('findGlossaryTerm matches by id or term case-insensitively and handles unknown input', () => {
  assert.equal(findGlossaryTerm('prompt')?.id, 'prompt');
  assert.equal(findGlossaryTerm('  MCP  ')?.id, 'mcp');
  assert.equal(findGlossaryTerm('Hallucination')?.id, 'hallucination');
  assert.equal(findGlossaryTerm('unknown-term'), null);
  assert.equal(findGlossaryTerm(''), null);
  assert.equal(findGlossaryTerm(null), null);
});
