import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { render, cleanup } from '@testing-library/react';
import React from 'react';
import * as esbuild from 'esbuild';
import path from 'path';
import fs from 'fs';

async function loadChapterPath() {
  const outfile = path.join('test', 'chapterpath.bundle.js');
  const stubPlugin = {
    name: 'stub',
    setup(build) {
      build.onResolve({ filter: /^\.\.\/services\/courseService$/ }, () => ({ path: 'courseService', namespace: 'stub' }));
      build.onResolve({ filter: /^\.\.\/hooks\/useUserProgress$/ }, () => ({ path: 'useUserProgress', namespace: 'stub' }));
      build.onResolve({ filter: /^\.\/SupabaseAuthProvider$/ }, () => ({ path: 'SupabaseAuthProvider', namespace: 'stub' }));
      build.onResolve({ filter: /^framer-motion$/ }, () => ({ path: 'framer-motion', namespace: 'stub' }));
      build.onLoad({ filter: /^courseService$/, namespace: 'stub' }, () => ({
        contents: `export async function fetchChapters(){return [{id:1,title:'Chap'}];}
export async function fetchSections(){return [{id:1},{id:2},{id:3}]};`,
        loader: 'ts'
      }));
      build.onLoad({ filter: /^useUserProgress$/, namespace: 'stub' }, () => ({
        contents: 'export default function useUserProgress(){return {sectionProgressMap:{}};}',
        loader: 'ts'
      }));
      build.onLoad({ filter: /^SupabaseAuthProvider$/, namespace: 'stub' }, () => ({
        contents: `export function useAuth(){return {profile:null};}
export default function SupabaseAuthProvider({children}){return children;}`,
        loader: 'tsx'
      }));
      build.onLoad({ filter: /^framer-motion$/, namespace: 'stub' }, () => ({
        contents: `import React from 'react';
export const motion={div:(p)=>React.createElement('div',p)};`,
        loader: 'tsx',
        resolveDir: '.'
      }));
    }
  };
  await esbuild.build({
    entryPoints: ['src/components/ChapterPath.tsx'],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    outfile,
    plugins: [stubPlugin],
    absWorkingDir: process.cwd(),
    external: ['react', 'react-dom'],
    jsx: 'automatic'
  });
  const mod = await import('./chapterpath.bundle.js');
  fs.unlinkSync(outfile);
  return mod.default;
}

test('ChapterPath renders layout correctly', async () => {
  const ChapterPath = await loadChapterPath();
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });

  const { container } = render(
    React.createElement(ChapterPath, { onSectionSelect() {} })
  );
  await new Promise(r => setTimeout(r, 0));

  const buttons = container.querySelectorAll('button');
  assert.equal(buttons.length, 3);
  buttons.forEach(btn => {
    assert.ok(btn.className.includes('w-24'));
    assert.ok(btn.className.includes('h-24'));
  });

  const svgs = container.querySelectorAll('svg');
  assert.ok(svgs.length > 0);

  const wrappers = container.querySelectorAll('div[data-testid="section-item"]');
  wrappers.forEach((wrap, idx) => {
    if (idx % 2 === 0) {
      assert.ok(
        wrap.className.includes('self-start') ||
          wrap.style.alignSelf === 'flex-start'
      );
    } else {
      assert.ok(
        wrap.className.includes('self-end') ||
          wrap.style.alignSelf === 'flex-end'
      );
    }
  });
  cleanup();
  dom.window.close();
});
