import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatQuizResult } from '../src/bot/utils/formatter.js';

test('formatQuizResult excellent', () => {
  const msg = formatQuizResult(9, 10);
  assert.ok(msg.includes('9/10'));
  assert.ok(msg.includes('90%'));
  assert.ok(msg.includes('🏆'));
});

test('formatQuizResult good', () => {
  const msg = formatQuizResult(7, 10);
  assert.ok(msg.includes('7/10'));
  assert.ok(msg.includes('70%'));
  assert.ok(msg.includes('👍'));
});

test('formatQuizResult ok', () => {
  const msg = formatQuizResult(5, 10);
  assert.ok(msg.includes('5/10'));
  assert.ok(msg.includes('50%'));
  assert.ok(msg.includes('👌'));
});

test('formatQuizResult bad', () => {
  const msg = formatQuizResult(3, 10);
  assert.ok(msg.includes('3/10'));
  assert.ok(msg.includes('30%'));
  assert.ok(msg.includes('🤔'));
});
