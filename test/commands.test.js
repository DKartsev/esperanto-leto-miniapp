import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handleStartCommand, handleCallbackQuery } from '../src/bot/commands.js';
import { startQuiz } from '../src/bot/handlers/quizHandler.js';

// Helper to create mock Telegraf context
function createCtx() {
  const ctx = {
    chat: { id: 1 },
    from: { id: 1, first_name: 'Tester' },
    calls: [],
    telegram: {
      sendMessage: (...args) => {
        ctx.calls.push({ method: 'sendMessage', args });
        return Promise.resolve();
      }
    },
    answerCbQuery: (...args) => {
      ctx.calls.push({ method: 'answerCbQuery', args });
      return Promise.resolve();
    }
  };
  return ctx;
}

// /start command should send welcome message
test('handleStartCommand sends welcome text', async () => {
  const ctx = createCtx();
  handleStartCommand(ctx);
  // wait microtask chain
  await Promise.resolve();
  assert.ok(ctx.calls.some(c => c.method === 'sendMessage'));
});

// startQuiz should send first question
test('startQuiz sends first question', async () => {
  const ctx = createCtx();
  startQuiz(ctx);
  await Promise.resolve();
  assert.ok(ctx.calls.some(c => c.method === 'sendMessage'));
});

// handleCallbackQuery responds to start_test
test('handleCallbackQuery start_test', async () => {
  const ctx = createCtx();
  ctx.callbackQuery = {
    id: 'cb1',
    data: 'start_test',
    from: ctx.from,
    message: { chat: ctx.chat }
  };
  await handleCallbackQuery(ctx);
  assert.ok(ctx.calls.some(c => c.method === 'answerCbQuery'));
  assert.ok(ctx.calls.some(c => c.method === 'sendMessage'));
});
